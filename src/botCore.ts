import { AbstractExchange } from './exchanges';
import { Strategy } from './strategy';
import type { DatastoreInterface } from './datastore';
import CONFIG from './config';

export abstract class BaseComponent {
    protected mediator: Mediator;

    constructor(mediator: Mediator = null) {
        this.mediator = mediator;
    }

    public setMediator(mediator: Mediator): void {
        this.mediator = mediator;
    }
}

export interface Mediator {
    getDatastore(): DatastoreInterface;
}

export class Bot implements Mediator {
    private exchangeapi: AbstractExchange;
    private strategies: Strategy[] = [];
    private datastore: DatastoreInterface;
    private MODE: string;
    private readonly symbol: string = CONFIG.TRADE.SYMBOL;
    private timeframe: string = CONFIG.TRADE.TIMEFRAME;
    constructor(ExchangeAPI: new () => AbstractExchange, _strategies?: typeof Strategy[] | undefined) {
        this.exchangeapi = new ExchangeAPI()
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
        const ohlcv = await this.exchangeapi.fetchOHLCV(this.symbol, this.timeframe, Date.now() - 3600 * 3000)
        this.datastore.setOHLCV(ohlcv);
        console.log('[Info] OHLCV :>> ', ohlcv);
    }
    private async updateStatus() {
        console.log('[Info]:Process: Updating order status...');
        const values = this.datastore.getActiveOrders().values()
        await this.exchangeapi.fetchOrders(values)
        this.datastore.updateOrderStatus();
        console.log('[Info]:Process: Done updating order status...');
        /* db???
        Mapnoのキーとidが違うので，idToOrderNameかdbの検索をすることでid=>keyを手に入れる必要がある
         */
        // const iterator = this.dataStore.getActiveOrders();
        // for (const [, value] of iterator) ids.push(value['id']);
        // const orders = this.exchangeapi.fetchOrders(ids)
        // this.dataStore.updateOrderStatus(orders);
    }
    public async cancel() {
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
    public getDatastore(): DatastoreInterface { return this.datastore }
    public async main() {
        if (
            this.datastore == undefined
            || this.exchangeapi == undefined
            || this.strategies.length == 0
        ) throw Error('[ERROR]: UNDEFINED_EXCHANGE_API_OR_DARASTORE');
        // this.setActiveOrders();//FOR TEST
        await this.setOHLCV();
        await this.updateStatus();
        this.exeStrategy()
        await this.order()
        await this.cancel()
    }
    public async order() {
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
    public setExchange(ExchangeAPI: new () => AbstractExchange): void {
        this.exchangeapi = new ExchangeAPI()
    }
    public setDatastore(Datastore: new () => DatastoreInterface): void {
        this.datastore = new Datastore();
    }
    public setStrategy(_strategies: typeof Strategy[]): void {
        if (_strategies instanceof Array) {
            _strategies.forEach(el => this.strategies.push(new el(this)));
        }
    }

    
    // protected setTradeConfig(mode: string, symbol: string) {
    //     this.MODE = mode;
    //     this.symbol = symbol;
    // }
    // private setActiveOrders() {
    //     // FOR_TEST
    //     const test: Order = {
    //         orderName: 'expectDeleted',
    //         id: '17173028975',
    //         symbol: 'ETH-PERP',
    //         timestamp: 1607426266792,
    //         type: 'limit',
    //         side: 'buy',
    //         status: 'open',
    //         amount: 0.001,
    //         price: 466.85,
    //         params: {},
    //         expiracy: Date.now() - 3600 * 1000
    //     }
    //     this.datastore.getActiveOrders().set('expectDeleted', test)
    // }
}