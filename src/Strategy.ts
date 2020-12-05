import { Mediator } from './Mediator';
import { Order } from './DataStore';

abstract class AbstractStrategy {
    protected abstract mediator: Mediator;
    public strategy(): Order[] {
        const pyraminding = 0;
        const orders2 = [];
        const activeOrders = this.mediator.dataStoreMethods('activeOrders');
        const position = this.mediator.dataStoreMethods('position')

        if (position > 1000) {
            orders2.push(this.hookWhenHavePosi());
            if (activeOrders.size >= 3) return
        }
        // すでに約定していてポジションを持っている時かつPyraminging 数>1のとき
        orders2.push(this.algorithym());
        // this.mediator.dataStoreMethods('order')(orders2)
        return orders2
    }
    protected abstract exit()
    protected abstract algorithym()
    protected abstract hookWhenHavePosi()
}
export class Strategy extends AbstractStrategy {
    protected mediator: Mediator
    constructor(_mediator) {
        super();
        this.mediator = _mediator
    }
    protected exit() {
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
    public hookWhenHavePosi() { }
    protected setAmounts() { }
    protected setPrices() { }
}
