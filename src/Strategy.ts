import { AbstractClassExchange } from './Exchanges';
import { DataStoreInterface } from './DataStore';

abstract class AbstractStrategy {
    // protected abstract exchangeapi: AbstractClassExchange;
    protected abstract datastore: DataStoreInterface;
    // public setExchangeapi(comp): void { }
    public setDataStore(comp): void { }
    public strategy(): void {
        let orders2;
        const acticeOrder = this.datastore.pendingOrderCount();
        if (acticeOrder.length < 1) {
            let orders = this.algorithym()
        }
        // Pyraminging 数>1のとき
        if (1) { orders = [] }
        // ポジションを持ってる時
        if (1) {
            orders2 = this.hookWhenContracted()
        }
    }
    protected algorithym() { }
    public exit() { }
    public hookWhenContracted() { }
    public strategyWhenOrderOpen() { }
    public strategyWhenContracted() { }
}
export class Strategy extends AbstractStrategy {
    // protected exchangeapi: AbstractClassExchange
    protected datastore: DataStoreInterface
    constructor(comp, comp2) {
        super();
        // this.exchangeapi = comp
        this.datastore = comp2
    }
    // public setExchangeapi(comp) {
    //     this.exchangeapi = comp
    // }
    public setDataStore(comp): void { }
    public exit() {
        //Reduce Only
        const orders = [];
        return orders
    }
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
        const amounts = this.setAmounts()
        const prices = this.setPrices();
        return order;
    }
    public hookWhenContracted() { }
    protected setAmounts() { }
    protected setPrices() { }
    public strategyWhenNoPosition() { }
    public strategyWhenOrderOpen() { }
    public strategyWhenContracted() { }
}

export class Strategy2 extends AbstractStrategy {
    protected mediator: Mediator
    constructor(comp) {
        super();
        this.mediator = comp
    }
    public exit() {
        //Reduce Only
        const orders = [];
        return orders
    }
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
        const amounts = this.setAmounts()
        const prices = this.setPrices();
        return order;
    }
    public hookWhenContracted() { }
    protected setAmounts() { }
    protected setPrices() { }
    public strategyWhenNoPosition() { }
    public strategyWhenOrderOpen() { }
    public strategyWhenContracted() { }
}
