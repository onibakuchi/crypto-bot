import { BaseStrategy } from '../bot/bot-interface';
import type { Order, Position } from '../datastore/datastore-interface';
import CONFIG from '../config/config';

export abstract class AbstractStrategy extends BaseStrategy {
    protected MAX_ACTIVE_ORDERS: number;
    protected MAX_LEVERAGE: number;
    protected MODE: Boolean;
    protected PYRAMIDING: number;
    protected SYMBOL: string;
    constructor(mediator = null) {
        super(mediator);
        this.init();
    }
    private init(): void {
        try {
            this.MAX_ACTIVE_ORDERS = Number(CONFIG.TRADE.MAX_ACTIVE_ORDERS);
            this.MAX_LEVERAGE = Number(CONFIG.TRADE.MAX_LEVERAGE);
            this.MODE = CONFIG.TRADE.MODE.toLowerCase() == 'production';
            this.PYRAMIDING = Number(CONFIG.TRADE.PYRAMIDING);
            this.SYMBOL = CONFIG.TRADE.SYMBOL;
        } catch (e) {
            console.log('e :>> ', e);
            process.exit(1);
        }
    }
    public strategy(): Order[] {
        const newOrders: Order[] = [];
        const datastore = this.mediator.getDatastore();
        const activeOrdMap = datastore.getActiveOrders()
        const ohlcv = datastore.getOHCV();
        const position = datastore.getPosition();

        if (position.amountUSD > 0) {
            newOrders.push(...this.hookWhenHavePosi(ohlcv, position));
            if (activeOrdMap.size >= 3) {
                console.log('newOrders :>> ', newOrders);
                return newOrders
            }
        }
        // すでに約定していてポジションを持っている時かつPyraminging 数>1のとき
        const result = this.MODE ? this.algorithym(ohlcv, position) : this.testAlgorithym(ohlcv, position);
        newOrders.push(...result);

        console.log('newOrders :>> ', newOrders);
        return newOrders
    }
    protected limitOrder(name, side, amount, price, duration = 10 * 60, params = {}) {
        const template: Order = {
            orderName: name,
            id: '',
            symbol: this.SYMBOL,
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
    protected abstract algorithym(ohlcv: number[][], potision: Position, params?): Order[]
    protected abstract exit(ohlcv: number[][], position: Position): Order[]
    protected abstract hookWhenHavePosi(ohlcv: number[][], position: Position): Order[]
    protected abstract testAlgorithym(ohlcv: number[][], position: Position): Order[]
}

export class HigeCatchStrategy extends AbstractStrategy {
    protected algorithym(ohlcv: number[][], position: Position): Order[] {
        //  Non Reduce Only
        const orders = [];
        const ord1 = this.limitOrder('hige4.8%', 'buy', 0.001, ohlcv[ohlcv.length - 1 - 4][4] * 0.952, 10 * 60)
        const ord15 = this.limitOrder('hige5.4%', 'buy', 0.003, ohlcv[ohlcv.length - 1 - 4][4] * 0.946, 12 * 60)
        const ord2 = this.limitOrder('hige5.8%', 'buy', 0.004, ohlcv[ohlcv.length - 1 - 4][4] * 0.942, 15 * 60)
        const ord3 = this.limitOrder('hige6.3%', 'buy', 0.005, ohlcv[ohlcv.length - 1 - 4][4] * 0.937, 15 * 60)

        orders.push(ord1, ord15, ord2, ord3)
        return orders;
    }
    protected exit(ohlcv: number[][], position: Position): Order[] { return }
    protected hookWhenHavePosi(ohlcv: number[][], position: Position): Order[] {
        const orders = this.limitOrder('settlement', 'sell', position.amount, position.avgOpenPrice + 300, 20 * 60)
        return [orders];
    }
    protected setAmounts() { }
    protected setPrices() { }
    protected testAlgorithym(ohlcv: number[][], position: Position): Order[] {
        const order: Order = this.limitOrder('testOrder1', 'buy', 0.001, Math.random() * 30 + 430, 10 * 60)
        return [order]
    }

}
