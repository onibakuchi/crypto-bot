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
    private async updateStatus() {
        const values =  this.dataStore.getActiveOrders().values()
        const fetchedOrds = await this.exchangeapi.fetchOrders(values)
        this.dataStore.updateOrderStatus(fetchedOrds);

        /* db???
        Mapnoのキーとidが違うので，idToOrderNameかdbの検索をすることでid=>keyを手に入れる必要がある
         */
        // const iterator = this.dataStore.getActiveOrders();
        // for (const [, value] of iterator) ids.push(value['id']);
        // const orders = this.exchangeapi.fetchOrders(ids)
        // this.dataStore.updateOrderStatus(orders);
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
        //
        try {
            const createedOrds = await this.exchangeapi.createOrders(orders);
            // this.dataStore.setActiveOrder()
            this.dataStore.setActiveOrders('key', createedOrds)
        } catch (e) { }
    }
    public async cancel() {
        const expiredOrders = this.dataStore.getExpiredOrders()
        // Mediator側で複数のオーダーを一個ずつイテレートする
        const canceled = []
        // for (const order of expiredOrders) {
        //     try {
        //         await new Promise((resolve) => setTimeout(resolve, 1000))
        //         const canceledOrder = await this.exchangeapi.cancelOrder(order)
        //         canceled.push(canceledOrder)
        //     } catch (e) {
        //     }
        // }
        // this.dataStore.deleteActiveOrders('key', canceled)

        // cancelOrdersはexchangeapi側で複数オーダーをイテレートするように委任する
        try {
            const canceledOrders = await this.exchangeapi.cancelOrders(expiredOrders)
            // this.dataStore.setActiveOrder()
            this.dataStore.deleteActiveOrders('key', canceledOrders)
        } catch (e) { }
    }
}
