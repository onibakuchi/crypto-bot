"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HigeCatchStrategy = exports.AbstractStrategy = void 0;
const bot_interface_1 = require("../bot-interface");
class AbstractStrategy extends bot_interface_1.BaseStrategy {
    constructor(mediator = null) {
        super(mediator);
    }
    init(config) {
        try {
            this.MAX_ACTIVE_ORDERS = Number(config.MAX_ACTIVE_ORDERS);
            this.MAX_LEVERAGE = Number(config.MAX_LEVERAGE);
            this.MODE = config.MODE.toLowerCase() == 'production';
            this.PYRAMIDING = Number(config.PYRAMIDING);
            this.SYMBOL = config.SYMBOL;
        }
        catch (e) {
            console.log('e :>> ', e);
            process.exit(1);
        }
    }
    strategy() {
        const newOrders = [];
        const datastore = this.mediator.getDatastore();
        const activeOrdMap = datastore.getActiveOrders();
        const ohlcv = datastore.getOHCV();
        const position = datastore.getPosition();
        if (position.amountUSD > 0) {
            newOrders.push(...this.hookWhenHavePosi(ohlcv, position));
            if (activeOrdMap.size >= 3) {
                console.log('exitOrders :>> ', newOrders);
                return newOrders;
            }
        }
        // すでに約定していてポジションを持っている時かつPyraminging 数>1のとき
        const result = this.MODE ? this.algorithym(ohlcv, position) : this.testAlgorithym(ohlcv, position);
        newOrders.push(...result);
        console.log('newOrders :>> ', newOrders);
        return newOrders;
    }
    limitOrder(name, side, amount, price, duration = 10 * 60, params = {}) {
        const template = {
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
        };
        const ord = Object.assign({}, template);
        return ord;
    }
}
exports.AbstractStrategy = AbstractStrategy;
class HigeCatchStrategy extends AbstractStrategy {
    algorithym(ohlcv, position) {
        //  Non Reduce Only
        const orders = [];
        const ord1 = this.limitOrder('hige3.4%', 'buy', 0.001, ohlcv[ohlcv.length - 1 - 4][4] * 0.966, 7 * 60, { postOnly: true });
        const ord2 = this.limitOrder('hige3.8%', 'buy', 0.004, ohlcv[ohlcv.length - 1 - 4][4] * 0.942, 7 * 60, { postOnly: true });
        // const ord15 = this.limitOrder({ name: 'hige4.4%', side: 'buy', amount: 0.003, price: ohlcv[ohlcv.length - 1 - 4][4] * 0.956, duration: 12 * 60 })
        // const ord3 = this.limitOrder('hige6.3%', 'buy', 0.005, ohlcv[ohlcv.length - 1 - 4][4] * 0.937, 15 * 60)
        orders.push(ord1, ord2);
        return orders;
    }
    exit(ohlcv, position) { return; }
    hookWhenHavePosi(ohlcv, position) {
        const params = {};
        const orders = this.limitOrder('settlement', 'sell', position.amount, position.avgOpenPrice + 300, 20 * 60, { postOnly: true, reduceOnly: true });
        return [orders];
    }
    setAmounts() { }
    setPrices() { }
    testAlgorithym(ohlcv, position) {
        const order = this.limitOrder('testOrder1', 'buy', 0.001, Math.random() * 30 + 430, 10 * 60);
        return [order];
    }
}
exports.HigeCatchStrategy = HigeCatchStrategy;
