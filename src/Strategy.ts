import { Mediator } from './Mediator';

abstract class AbstractStrategy {
    protected abstract mediator: Mediator;
    public strategy(): void {
        let orders2;
        const counts = this.mediator.dataStoreMethods('pendingCounts')
        if (counts >= 3) return;
        let orders = this.algorithym()
        // すでに約定していてポジションを持っている時かつPyraminging 数>1のとき
        if (1) {
            orders2.push({})
        }
        // this.mediator.dataStoreMethods('order')(orders2)
        return orders2
    }
    public exit() { }
    protected abstract algorithym()
    protected abstract hookWhenContracted()
}
export class Strategy extends AbstractStrategy {
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
            orderName: '',
            id: 0,
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
}
