import { AbstractExchange } from './Exchanges';
import { Strategy } from './Strategy';
import { DatastoreInterface, Order } from './Datastore';

export abstract class BaseComponentBot {
    protected mediator: Mediator;

    constructor(mediator: Mediator = null) {
        this.mediator = mediator;
    }

    public setMediator(mediator: Mediator): void {
        this.mediator = mediator;
    }
}

export interface Mediator {
    dataStoreMethods(methodName): any
}

export class Bot implements Mediator {
    private exchangeapi: AbstractExchange;
    private strategies: Strategy[] = [];
    private datastore: DatastoreInterface;
    private symbol: string = 'ETH-PERP';
    constructor(ExchangeAPI: new () => AbstractExchange, _strategies?: typeof Strategy[] | undefined) {
        this.exchangeapi = new ExchangeAPI()
        this.exchangeapi.setMediator(this);
        this.setStrategy(_strategies);
    }
    public setExchange(ExchangeAPI: new () => AbstractExchange): void {
        this.exchangeapi = new ExchangeAPI()
    }
    public setDatastore(Datastore: new () => DatastoreInterface): void {
        this.datastore = new Datastore()
    }
    public setStrategy(_strategies: typeof Strategy[]): void {
        if (_strategies instanceof Array) {
            _strategies.forEach(el => this.strategies.push(new el(this)));
        }
    }
    public dataStoreMethods(methodName) {
        const methods = {
            ohlcv: this.datastore.getOHCV,
            activeOrders: this.datastore.getActiveOrders,
            position: this.datastore.getPosition,
            order: this.datastore.setPreparedOrders,
        }
        return methods[methodName]
    }
    public async main() {
        if (
            this.datastore == undefined
            || this.exchangeapi == undefined
            || this.strategies.length == 0
        ) throw Error('[ERROR]: UNDEFINED_EXCHANGE_API_OR_DARASTORE');
        await this.setOHLCV();
        await this.updateStatus();
        this.exeStrategy()
        await this.order()
        return
        await this.cancel()
    }
    private async setOHLCV() {
        const ohlcv = await this.exchangeapi.fetchOHLCV(this.symbol, '1h', Date.now() - 3600 * 3000)
        this.datastore.setOHLCV(ohlcv);
        console.log('[Info] OHLCV :>> ', ohlcv);
    }
    private async updateStatus() {
        const values = this.datastore.getActiveOrders().values()
        await this.exchangeapi.fetchOrders(values)
        this.datastore.updateOrderStatus();
        /* db???
        Mapnoのキーとidが違うので，idToOrderNameかdbの検索をすることでid=>keyを手に入れる必要がある
         */
        // const iterator = this.dataStore.getActiveOrders();
        // for (const [, value] of iterator) ids.push(value['id']);
        // const orders = this.exchangeapi.fetchOrders(ids)
        // this.dataStore.updateOrderStatus(orders);
    }
    private exeStrategy() {
        console.log(`[Info]: Excute strategies....`);
        if (!this.datastore.getOHCV()) {
            console.log('[ERROR]:OHLCV_IS_EMPATY');
            console.log('[Info]:Skipped executing strategies');
        } else {
            for (const strategy of this.strategies) {
                try {
                    const orders = strategy.strategy()
                    this.datastore.setPreparedOrders(orders)
                    console.log('[Info]: Done excuting a strategy...');
                } catch (e) {
                    console.log('[ERROR]:ERROR_WHILE_EXCUTING_STRATEGY');
                    console.log('e :>> ', e);
                }
            }
        }
        console.log('[Info]: Done Excuting all strategies...');
    }
    public async order() {
        try {
            console.log('[Info]: Try to order...');
            const ordresMap = this.datastore.getPreparedOrders();
            await this.exchangeapi.createOrders(ordresMap.values());
            this.datastore.updatePreparedOrders();
        } catch (e) {
            console.log('e :>> ', e);
        }
    }
    public async cancel() {
        try {
            console.log('[Info]: Try to cancel order...');
            const expiredOrders = this.datastore.getExpiredOrders()
            await this.exchangeapi.cancelOrders(expiredOrders)
        } catch (e) {
            console.log('e :>> ', e);
        }
        // for (const order of expiredOrders) {
        //     try {
        //         await new Promise((resolve) => setTimeout(resolve, 1000))
        //         const canceledOrder = await this.exchangeapi.cancelOrder(order)
        //         canceled.push(canceledOrder)
        //     } catch (e) {
        //     }
        // }
        // this.dataStore.deleteActiveOrders('key', canceled)
    }
}