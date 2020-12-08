import { BaseComponentBot } from './Mediator';
import { Order } from './Datastore';

abstract class AbstractStrategy extends BaseComponentBot {
    // protected mediator: Mediator;
    // constructor(mediator) {
    //     super(mediator);
    // }
    public strategy(): Order[] {
        const pyraminding = 0;
        const orders2: Order[] = [];
        // const activeOrders = this.mediator.dataStoreMethods('activeOrders');
        const position = this.mediator.dataStoreMethods('position')

        if (position.amountUSD > 0) {
            orders2.push(...this.hookWhenHavePosi());
            // if (activeOrders.size >= 3) return
        }
        // console.log('activeOrders :>> ', activeOrders);
        // すでに約定していてポジションを持っている時かつPyraminging 数>1のとき
        orders2.push(...this.algorithym());
        console.log('order2 :>> ', orders2);
        // this.mediator.dataStoreMethods('order')(orders2)
        return orders2
    }
    // protected GenOrder(name, side, ordType, price, expiracy, params) { }
    protected abstract exit(): Order[]
    protected abstract algorithym(): Order[]
    protected abstract hookWhenHavePosi(): Order[]
}
export class Strategy extends AbstractStrategy {
    protected algorithym(): Order[] {
        //  Non Reduce Only
        const orderTemplete = {
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
        const order = this.testAlogo();
        return order;
    }
    protected exit() {
        //Reduce Only
        const orders = [];
        return orders
    }
    protected hookWhenHavePosi(): Order[] { return }
    protected setAmounts() { }
    protected setPrices() { }
    private testAlogo(): Order[] {
        const order: Order = {
            orderName: 'testOrder1',
            id: '',
            symbol: 'ETH-PERP',
            timestamp: 0,
            type: 'limit',
            side: "buy",
            status: '',
            amount: 0.001,
            price: Math.random() * 30 + 450,
            params: {},
            expiracy: Date.now() + 3600 * 1000,
        }
        return [order]
    }
}
