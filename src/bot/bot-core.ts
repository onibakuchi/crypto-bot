import { AbstractExchange, ExchangeRepositoryFactory } from '../exchanges/exchanges';
import { pushMessage } from '../notif/line';
import CONFIG from '../config/config';
import type { Mediator, BaseStrategy } from './bot-interface';
import type { DatastoreInterface, Order } from '../datastore/datastore-interface';

export class Bot implements Mediator {
    private readonly MODE: string = CONFIG.TRADE.MODE;
    private readonly symbol: string = CONFIG.TRADE.SYMBOL;
    private timeframe: string = CONFIG.TRADE.TIMEFRAME;
    private exchangeapi: AbstractExchange;
    private strategies: BaseStrategy[] = [];
    private datastore: DatastoreInterface;
    private timer: NodeJS.Timeout;

    constructor(exchangeId: string, _strategies?: (new () => BaseStrategy)[] | undefined) {
        this.exchangeapi = ExchangeRepositoryFactory.get(exchangeId);
        this.exchangeapi.setMediator(this);
        this.setStrategy(_strategies);
        console.log('[Info]: Launched...[mode]=', this.MODE);
    }
    private exeStrategy() {
        console.log(`[Info]: Excute strategies....`);
        if (this.datastore.getOHCV()) {
            for (const strategy of this.strategies) {
                try {
                    const orders = strategy.strategy()
                    this.datastore.setPreparedOrders(orders)
                    console.log('[Info]: Done excuting a strategy...');
                } catch (e) {
                    console.log('[ERROR]:ERROR_WHILE_EXCUTING_STRATEGY', e);
                }
            }
        } else {
            console.log('[ERROR]:OHLCV_IS_EMPATY');
            console.log('[Info]:Skipped executing strategies');
        }
        console.log('[Info]: Done Excuting all strategies...');
    }
    private async setOHLCV() {
        const ohlcv = await this.exchangeapi.fetchOHLCV(this.symbol, this.timeframe, Date.now() - 300 * 1000)
        this.datastore.setOHLCV(ohlcv);
        console.log('[Info] OHLCV :>> ', ohlcv);
    }
    private async updateStatus() {
        console.log('[Info]:Process: Updating order status...');
        const values = this.datastore.getActiveOrders().values()
        await this.exchangeapi.fetchOrders(values)
        this.datastore.updateOrderStatus();
        console.log('[Info]:Process: Done updating order status...');
    }
    private async cancel() {
        try {
            console.log('[Info]: Try to cancel order...');
            const expiredOrders = this.datastore.getExpiredOrders()
            if (expiredOrders.length > 0) {
                await this.exchangeapi.cancelOrders(expiredOrders)
            } else console.log('[Info]: No expired order...');
            console.log('[Info]: Done canceling expired orders...');
        } catch (e) {
            console.log('e :>> ', e);
        }
    }
    private async order() {
        try {
            console.log('[Info]: Try to order...');
            const values = this.datastore.getPreparedOrders().values();
            await this.exchangeapi.createOrders(values);
            this.datastore.updatePreparedOrders();
            console.log('[Info]: Done order...');
        } catch (e) {
            console.log('e :>> ', e);
        }
    }
    public getDatastore(): DatastoreInterface { return this.datastore }
    public getOrders(kind: 'prepared' | 'active' | 'contracted'): IterableIterator<Order> {
        if (kind == 'prepared')
            return this.datastore.getPreparedOrders().values();
        if (kind == 'active')
            return this.datastore.getActiveOrders().values();
        if (kind == 'contracted')
            return this.datastore.getContractedOrders().values();
        else console.log('[Warning]:NOT_MATCHED');
    }
    public async init() { await this.datastore.init() }
    public pushMessage(message: string) { pushMessage(message) }
    public async main() {
        if (
            this.datastore == undefined
            || this.exchangeapi == undefined
            || this.strategies.length == 0
        ) throw Error('[ERROR]: UNDEFINED_EXCHANGE_API_OR_DARASTORE_OR_STRATEGY');
        // this.setActiveOrders();//FOR TEST
        await this.setOHLCV();
        await this.updateStatus();
        this.exeStrategy()
        await this.order()
        await this.cancel()
        const contractedOrders = [...this.getDatastore().getContractedOrders().values()];
        this.getDatastore().getContractedOrders().clear()
        await this.saveToDb();
        return contractedOrders;
    }
    public async saveToDb() { await this.datastore.saveToDb() }
    public async start(): Promise<void> {
        await this.init();
        this.timer = setInterval(() => this.main(), Number(CONFIG.INTERVAL));
    }
    public async stop(): Promise<void> {
        if (this.timer) {
            clearInterval(this.timer);
        }
    }
    public setExchange(ExchangeAPI: new () => AbstractExchange): void {
        this.exchangeapi = new ExchangeAPI()
    }
    public setDatastore(Datastore: new () => DatastoreInterface): void {
        this.datastore = new Datastore();
    }
    public setStrategy(_strategies: (new (mediator) => BaseStrategy)[]): void {
        if (_strategies instanceof Array) {
            _strategies.forEach(el => this.strategies.push(new el(this)));
        }
    }
}