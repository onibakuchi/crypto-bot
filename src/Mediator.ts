import { AbstractClassExchange } from './Exchanges';
import { Strategy } from './Strategy';
import { DataStoreInterface } from './DataStore';

export interface Mediator {
    notify(sender: object, event: string): void;
    // notifSignal: { success: Boolean, method: String, result: any, }
}

export class ConcreteMediator2 implements Mediator {
    private exchangeapi: AbstractClassExchange;
    private component2: AbstractClassExchange;
    private strategies: Strategy[] = [];
    private dataStore: DataStoreInterface
    constructor() {
        this.exchangeapi.setMediator(this);
        this.component2.setMediator(this);
    }
    public notify(sender: object, event: string): void {

    }
    public dataStoreMethods(methodName) {
        const methods = {
            getOHLCV: this.dataStore.getOHCV,
            pendingOrderCount: this.dataStore.pendingOrderCount,
            getPreParedOrder: this.dataStore.getPreparedOrder,
            getActiveOrder: this.dataStore.getActiveOrder
        }
        return methods[methodName]
    }
    public setComponent(comp: AbstractClassExchange): void { }
    public setStrategy(_strategies: Strategy[]): void {
        this.strategies.push(new Strategy(this.exchangeapi, this.dataStore))
    }
    public main() {
        this.hook()
        this.exeStrategy()
        this.order()
        this.cancel()
    }
    private setOHLCV() {
        const ohlcv = this.exchangeapi.fetchOHLCV('USD', '1h', 1, 1, 1)
        this.dataStore.ohlcv = ohlcv;
    }
    private setPositionStatus() {
        const order = this.exchangeapi.fetfhActiveOrder()
        this.dataStore.setActiveOrder(order);
    }
    private hook() {
        this.setOHLCV();
        this.setPositionStatus();
    }
    private exeStrategy() {
        for (const strategy of this.strategies) {
            const order = strategy.strategy()
            this.dataStore.setPreparedOrder(order)
        }
    }
    public async order() {
        const orders = this.dataStore.getPreparedOrder()
        for (const ord of orders) {
            const promise = new Promise((resolve) => setTimeout(resolve, 1000))
            try {
                promise.then(() => this.exchangeapi.createOrder())
                await this.exchangeapi.createOrder();
                // this.dataStore.setActiveOrder()
                this.dataStore.setActiveOrder(ord)
            } catch (e) {

            }
        }
    }
    public async cancel() {
        const expiredOrders = this.dataStore.getExpiredOrder()
        for (const ord of expiredOrders) {
            try {
                const promise = new Promise((resolve) => setTimeout(resolve, 1000))
                promise.then(() => this.exchangeapi.cancelOrder())
                // this.dataStore.setActiveOrder()
                this.dataStore.deleteActiveOrder(ord)
            } catch (e) {

            }

        }
    }
}
