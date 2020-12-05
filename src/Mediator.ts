import { AbstractClassExchange } from './Exchanges';
import { Strategy } from './Strategy';
import { DataStoreInterface, Order } from './DataStore';


export interface Mediator {
    notify(sender: object, event: string): void;
    dataStoreMethods(methodName): any
}

export class ConcreteMediator2 implements Mediator {
    private exchangeapi: AbstractClassExchange;
    private component2: AbstractClassExchange;
    private strategies: Strategy[];
    private dataStore: DataStoreInterface
    constructor() {
        this.exchangeapi.setMediator(this);
        this.component2.setMediator(this);
    }
    public notify(sender: object, event: string): void { }
    public dataStoreMethods(methodName) {
        const methods = {
            ohlcv: this.dataStore.getOHCV,
            pendingOrderCount: this.dataStore.pendingOrderCount,
            preparedOrder: this.dataStore.getPreparedOrders,
            activeOrder: this.dataStore.getActiveOrders,
            order: this.dataStore.setPreparedOrders,
        }
        return methods[methodName]
    }
    public setExchange(comp: AbstractClassExchange): void { }
    public setStrategy(_strategies: typeof Strategy[]): void {
        // this.strategies.push(new _strategies[2](this))
        _strategies.forEach(el => this.strategies.push(new el(this)));
    }
    private adapter(orders: Order[]) {
        const copiedOrds: Order[] = JSON.parse(JSON.stringify(orders))
        copiedOrds.forEach(el => {
            delete el.expiracy
            delete el.orderName
            delete el.id
        })
        return copiedOrds
    }
    public main() {
        this.setOHLCV();
        this.updateStatus();
        this.exeStrategy()
        this.order()
        this.cancel()
    }
    private setOHLCV() {
        const ohlcv = this.exchangeapi.fetchOHLCV('USD', '1h', 1, 1, 1)
        this.dataStore.setOHLCV(ohlcv);
    }
    private updateStatus() {
        const ids = this.dataStore.getActiveOrders()
        const orders = this.exchangeapi.fetchOrders(ids)
        this.dataStore.setActiveOrders(orders);
    }
    private exeStrategy() {
        for (const strategy of this.strategies) {
            const orders = strategy.strategy()
            this.dataStore.setPreparedOrders(orders)
        }
    }
    public async order() {
        const orders = this.dataStore.getPreparedOrders()
        for (const order of orders) {
            try {
                await new Promise((resolve) => setTimeout(resolve, 1000))
                await this.exchangeapi.createOrder(order);
                this.dataStore.setActiveOrders(order)
            } catch (e) {

            }
        }
    }
    public async cancel() {
        const expiredOrders = this.dataStore.getExpiredOrders()
        // Mediator側で複数のオーダーを一個ずつイテレートする
        const canceled = []
        for (const order of expiredOrders) {
            try {
                await new Promise((resolve) => setTimeout(resolve, 1000))
                const canceledOrder = await this.exchangeapi.cancelOrder(order)
                canceled.push(canceledOrder)
            } catch (e) {
            }
        }
        this.dataStore.deleteActiveOrders('key', canceled)

        // cancelOrdersはexchangeapi側で複数オーダーをイテレートするように委任する
        try {
            const canceledOrders = await this.exchangeapi.cancelOrders(expiredOrders)
            // this.dataStore.setActiveOrder()
            this.dataStore.deleteActiveOrders('key', canceledOrders)
        } catch (e) { }

        // try {
        //     // await new Promise((resolve) => setTimeout(resolve, 1000))
        //     const expiredOrders = this.dataStore.getExpiredOrders()
        //     //**cancelOrderがasyncジェネレーターである必要がある***
        //     for await (const canceledOrdKey of this.exchangeapi.cancelOrders(expiredOrders)) {
        //         if (canceledOrdKey) {
        //             this.dataStore.deleteActiveOrders(canceledOrdKey,{})
        //         }
        //     }
        //     // this.dataStore.setActiveOrder()
        // } catch (e) {

        // }
    }
}
