import { BaseComponent } from './botCore';
import type { Order, Position } from './datastore';
import CONFIG from './config';

abstract class AbstractStrategy extends BaseComponent {
    protected PYRAMIDING: number;
    protected MAX_ACTIVE_ORDERS: number;
    protected MAX_LEVERAGE: number;
    protected IS_PRODUCTION_MODE: Boolean;
    protected SYMBOL: string;
    constructor(mediator = null) {
        super(mediator);
        this.init();
    }
    public strategy(): Order[] {
        const newOrders: Order[] = [];
        const datastore = this.mediator.getDatastore();
        const activeOrdMap = datastore.getActiveOrders()
        const ohlcv = datastore.getOHCV();
        const position = datastore.getPosition();

        if (position.amountUSD > 0) {
            newOrders.push(...this.hookWhenHavePosi());
            if (activeOrdMap.size >= 3) return newOrders
        }
        // すでに約定していてポジションを持っている時かつPyraminging 数>1のとき
        const result = this.IS_PRODUCTION_MODE ? this.algorithym(ohlcv, position) : this.testAlgorithym(ohlcv, position);
        newOrders.push(...result);

        console.log('newOrders :>> ', newOrders);
        return newOrders
    }
    public init(): void {
        this.IS_PRODUCTION_MODE = CONFIG.TRADE.TRADE_ENV.toLowerCase() == 'production';
        this.SYMBOL = CONFIG.TRADE.SYMBOL;
        this.PYRAMIDING = Number(CONFIG.TRADE.PYRAMIDING);
        this.MAX_ACTIVE_ORDERS = Number(CONFIG.TRADE.MAX_ACTIVE_ORDERS);
        this.MAX_LEVERAGE = Number(CONFIG.TRADE.MAX_LEVERAGE);
    }
    protected abstract algorithym(ohlcv: number[][], potision: Position, params?): Order[]
    protected abstract testAlgorithym(ohlcv: number[][], position: Position): Order[]
    protected abstract hookWhenHavePosi(): Order[]
    protected abstract exit(): Order[]
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
            expiration: 10,
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
    private order(name, side, amount, price, duration = 10 * 60, params = {}) {
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
            expiration: Date.now() + duration * 1000,
        }
        const ord = Object.assign({}, template);
        return ord;
    }
    protected hookWhenHavePosi(): Order[] { return }
    protected setAmounts() { }
    protected setPrices() { }
    protected testAlgorithym(ohlcv: number[][], position: Position): Order[] {
        const order: Order = this.order('testOrder1', 'buy', 0.001, Math.random() * 30 + 430)
        return [order]
    }
}
