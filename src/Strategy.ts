import { AbstractClassExchange } from './Exchanges';
import { DataStoreInterface } from './DataStore';

abstract class AbstractStrategy {
    protected abstract exchangeapi: AbstractClassExchange;
    protected abstract datastore: DataStoreInterface;
    public setExchangeapi(comp): void { }
    public setDataStore(comp): void { }
    public strategy(): void {
        // const status = this.datastore.getStatus()
        // if (status == 'Position') {
        //     return
        // }
        // if (status == 'ActiveOrder') return this.strategyWhenOrderOpen()
        // if (status == 'Await') return
        // if (status == 'Error') return
        let orders2;
        let orders = this.algorithym()
        // Pyraminging 数>1のとき
        if (1) { orders = [] }
        // ポジションを持ってる時
        if (1) {
            orders2 = this.hookWhenContracted()
        }
        return { order, orders2 }
    }
    protected algorithym() { }
    public exit() { }
    public hookWhenContracted() { }
    public strategyWhenOrderOpen() { }
    public strategyWhenContracted() { }
}
export class Strategy extends AbstractStrategy {
    protected exchangeapi: AbstractClassExchange
    protected datastore: DataStoreInterface
    constructor(comp, comp2) {
        super();
        this.exchangeapi = comp
        this.datastore = comp2
    }
    public setExchangeapi(comp) {
        this.exchangeapi = comp
    }
    public setDataStore(comp): void { }
    public calculation() {
    }
    public exit() {
        //Reduce Only
        const orders = [];
        return orders
    }
    public strategyWhenNoPosition() { }
    protected algorithym() {
        //  Non Reduce Only
        const order = {
            symbol: '',
            side: '',
            ordType: '',
            price: '',
            params: {},
            expiracy: 10,
        }
        this.setQuantity()
        this.setPrice();
    }
    public hookWhenContracted() { }
    protected setQuantity() { }
    protected setPrice() { }
    public strategyWhenOrderOpen() { }
    public strategyWhenContracted() { }
}
