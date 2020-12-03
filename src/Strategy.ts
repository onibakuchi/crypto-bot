import { Mediator } from './Mediator';

abstract class AbstractStrategy {
    protected abstract mediator: Mediator;
    public strategy(): void {
        let orders2;
        const counts = this.mediator.dataStoreMethods('pendingCounts')
        if (counts < 1) {
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
