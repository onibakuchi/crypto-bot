import { BaseComponentBot } from './Mediator';
import { Order, Position } from './Datastore';

abstract class AbstractStrategy extends BaseComponentBot {
    public strategy(): Order[] {
        const datastore = this.mediator.getDatastore();
        const pyraminding = 0;
        const newOrders: Order[] = [];

        const activeOrdMap = datastore.getActiveOrders()
        const ohlcv = datastore.getOHCV();
        const position = datastore.getPosition();
        if (position.amountUSD > 0) {
            newOrders.push(...this.hookWhenHavePosi());
            if (activeOrdMap.size >= 3) return newOrders
        }
        // すでに約定していてポジションを持っている時かつPyraminging 数>1のとき
        newOrders.push(...this.algorithym(ohlcv, position));
        console.log('newOrders :>> ', newOrders);
        return newOrders
    }
    // protected GenOrder(name, side, ordType, price, expiracy, params) { }
    protected abstract exit(): Order[]
    protected abstract algorithym(ohlcv: number[][], potision: Position, params?): Order[]
    protected abstract hookWhenHavePosi(): Order[]
}
export class Strategy extends AbstractStrategy {
    protected algorithym(ohlcv: number[][], position: Position): Order[] {
        //  Non Reduce Only
        const orders = [];
        const price5MinAgo = ohlcv[ohlcv.length - 2][4];
        const template: Order = {
            orderName: '',
            id: '',
            symbol: '',
            status: '',
            side: 'buy',
            type: 'limit',
            amount: 0.001,
            timestamp: 0,
            price: 0,
            params: {},
            expiracy: 10,
        }
        const ord1 = this.order('hige5%', 'buy', 0.001, ohlcv[ohlcv.length - 2][4] * 0.95, 10 * 60)
        const ord15 = this.order('hige5.8%', 'buy', 0.003, ohlcv[ohlcv.length - 1][4] * 0.942)
        const ord2 = this.order('hige6.3%', 'buy', 0.004, ohlcv[ohlcv.length - 1][4] * 0.937, 12 * 60)
        const ord3 = this.order('hige6.7%', 'buy', 0.005, ohlcv[ohlcv.length - 2][4] * 0.933, 15 * 60)

        orders.push(ord1, ord15, ord2, ord3)
        return orders;
    }
    protected exit() {
        //Reduce Only
        const orders = [];
        return orders
    }
    private order(name, side, amount, price, expiracy = 10 * 60, params = {}) {
        const template: Order = {
            orderName: name,
            id: '',
            symbol: 'ETH-PERP',
            status: '',
            side: side,
            type: 'limit',
            amount: amount,
            timestamp: 0,
            price: price,
            params: params,
            expiracy: Date.now() + expiracy * 1000,
        }
        const ord = Object.assign({}, template);
        return ord;
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
