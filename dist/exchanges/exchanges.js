"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExchangeRepositoryFactory = exports.AbstractExchange = void 0;
const ccxt_1 = __importDefault(require("ccxt"));
const bot_interface_1 = require("../bot-interface");
const config_1 = __importDefault(require("../config/config"));
class AbstractExchange extends bot_interface_1.BaseComponent {
    constructor(mediator = null) {
        super(mediator);
        this.maxRetry = 1;
        this.ONLY_PUBLIC = false;
        this.setCCXT = () => {
            const keys = this.setKey(this.exchangeId);
            this.CCXT = new ccxt_1.default[this.exchangeId.toLowerCase()]({
                'apiKey': keys === null || keys === void 0 ? void 0 : keys.APIKEY,
                'secret': keys === null || keys === void 0 ? void 0 : keys.APISECRET,
                'enableRateLimit': true,
                // 'verbose': true,
                'options': { 'adjustForTimeDifference': true }
            });
        };
    }
    setKey(exchangeId) {
        if (this.ONLY_PUBLIC)
            return;
        if (config_1.default[exchangeId.toUpperCase()]["APIKEY"] && config_1.default[exchangeId.toUpperCase()]["APISECRET"]) {
            return {
                'APIKEY': config_1.default[exchangeId.toUpperCase()]["APIKEY"],
                'APISECRET': config_1.default[exchangeId.toUpperCase()]["APISECRET"]
            };
        }
        else
            throw Error(`[ERROR]:CANNOT_FIND_${this.exchangeId.toUpperCase()}_APIKEYS`);
    }
    updateOrder(target, source) {
        target.status = source.status;
        source.id && (target.id = source.id);
        source.timestamp && (target.timestamp = source.timestamp);
    }
    // protected abstract handleError(e: Error, order: Order): void;
    async createOrder(order, counts = 0) {
        try {
            const { id, symbol, type, side, amount, price, params } = order;
            const res = await this.CCXT.createOrder(symbol, type, side, amount, price, params);
            this.updateOrder(order, res);
            console.log(res);
        }
        catch (e) {
            console.log('[ERROR]:function CreateOrder\n', e);
            if (counts <= 1) {
                console.log('[Info]:Retry...');
                await this.createOrder(order, counts++);
            }
            else
                console.log('[ERROR]:Retry Failed');
        }
        return order;
    }
    async createOrders(orders, counts = 0) {
        console.log('[Info]:Calling function createOrders...');
        for (const order of orders) {
            try {
                const { id, symbol, type, side, amount, price, params } = order;
                if (symbol == undefined)
                    throw TypeError('BadSymbol:symbol is undefined');
                await new Promise((resolve) => setTimeout(resolve, 1000));
                const res = await this.CCXT.createOrder(symbol, type, side, amount, price, params);
                this.updateOrder(order, res);
                console.log('[Info]:Success... Created a order <Order> :>>', order);
            }
            catch (e) {
                console.log('[ERROR]:function CreateOrders\n', e);
                if (e instanceof TypeError) {
                    console.log('[ERROR]: INVALID_ORDER_PROPERTY <Order>:>>', order);
                    continue;
                }
                await this.pushMessage(JSON.stringify(e));
                if (counts >= this.maxRetry) {
                    console.log('[ERROR]:Retry Failed');
                }
                else {
                    console.log('[Info]:Retry...');
                    await this.createOrders([order], counts + 1);
                }
                // if (counts <= this.maxRetry) {
                //     console.log('[Info]:Retry...');
                //     await this.createOrders([order], counts++);
                // } else console.log('[ERROR]:Retry Failed');
            }
        }
        return orders;
    }
    async cancelOrder(e, order) { }
    async cancelOrders(orders, counts = 0) {
        console.log('[Info]:Calling function cancelOrders...');
        for (const order of orders) {
            try {
                const { id, symbol, type, side, amount, price, params } = order;
                await new Promise((resolve) => setTimeout(resolve, 1000));
                const res = await this.CCXT.cancelOrder(id, symbol, params);
                this.updateOrder(order, res);
                console.log('[Info]: Success.. Canceled order <Order>', order);
            }
            catch (e) {
                console.log('[ERROR]:function cancelOrders\n', e);
                if (counts <= this.maxRetry) {
                    console.log('[Info]:Retry...');
                    await this.cancelOrders([order], counts + 1);
                }
                else
                    console.log('[ERROR]:Retry Failed');
            }
        }
        return orders;
    }
    async fetchOHLCV(symbol, timeframe, since, limit, params, counts = 0) {
        try {
            return await this.CCXT.fetchOHLCV(symbol, timeframe, since, limit, params);
        }
        catch (e) {
            console.log('[ERROR]:function fetchOHLCV', e);
            if (counts <= this.maxRetry) {
                await this.fetchOHLCV(symbol, timeframe, since, limit, params, counts + 1);
                console.log('[Info]:Retry...');
            }
            else
                console.log('[ERROR]:Retry Failed');
        }
    }
    async fetchOrders(orders, counts = 0) {
        console.log(`[Info]: Fetch order status under the managment via Exchange API...`);
        for (const order of orders) {
            try {
                const { id, symbol, type, side, amount, price, params } = order;
                await new Promise((resolve) => setTimeout(resolve, 1000));
                const res = await this.CCXT.fetchOrder(id, symbol, params);
                this.updateOrder(order, res);
            }
            catch (e) {
                console.log('[ERROR]:function fetchOrders\n', e);
                if (counts <= this.maxRetry) {
                    console.log('[Info]:Retry...');
                    await this.fetchOrders([order], counts + 1);
                }
                else
                    console.log('[ERROR]:Retry Failed');
            }
        }
        console.log(`[Info]: Fetch order status.. Done...`);
        return orders;
    }
    async fetchTickers(symbols, params) {
        if (this.CCXT.has['fetchTickers'] == false) {
            const tickers = {};
            for (const symbol of symbols) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                const res = await this.CCXT.fetchTicker(symbol);
                tickers[symbol] = res;
            }
            return tickers;
        }
        else {
            return await this.CCXT.fetchTickers(symbols, params);
        }
    }
}
exports.AbstractExchange = AbstractExchange;
class BitBank extends AbstractExchange {
    constructor(mediator = null) {
        super(mediator);
        this.exchangeId = 'bitbank';
        this.ONLY_PUBLIC = true;
        this.setCCXT();
    }
    async fetchPosition() { return Promise.reject(); }
}
class FTX extends AbstractExchange {
    constructor(mediator = null) {
        super(mediator);
        this.exchangeId = 'ftx';
        this.setCCXT();
    }
    async fetchPosition(symbol, params = {}) {
        const data = await this.CCXT.fetchPositions(params);
        for (const d of data) {
            if (d.future = symbol) {
                const position = {
                    symbol: d.future,
                    side: d.side,
                    amount: d.size,
                    amountUSD: d.cost,
                    avgOpenPrice: d.entryPrice,
                    breakEvenPrice: 0,
                };
                return position;
            }
        }
    }
}
// class BitMEX extends AbstractExchange {
//     protected exchangeId: string = 'bitmex';
//     constructor(mediator = null) {
//         super(mediator);
//         this.setCCXT();
//         this.CCXT.urls['api'] = this.CCXT.urls['test'];
//     }
// }
class CoinCheck extends AbstractExchange {
    constructor(mediator = null) {
        super(mediator);
        this.ONLY_PUBLIC = true;
        this.exchangeId = 'coincheck';
        this.setCCXT();
    }
    async fetchPosition() { return Promise.reject(); }
}
const ExchangeRepositories = {
    'bitbank': new BitBank(),
    'coincheck': new CoinCheck(),
    'ftx': new FTX(),
};
exports.ExchangeRepositoryFactory = {
    get: (name) => ExchangeRepositories[name]
};
// (async function () {
//     const symbol = 'ETH-PERP'
//     const timeframe = '1h'
//     const since = Date.now() - 3 * 3600 * 1000
//     // const ftx = new ExchangeRepositories['ftx']()
//     const order: Order = {
//         orderName: 'test',
//         id: '16962050770',
//         symbol: symbol,
//         timestamp: 0,
//         type: 'limit',
//         side: "buy",
//         status: '',
//         amount: 0.001,
//         price: Math.random() * 30 + 450,
//         params: {},
//         expiration: Date.now(),
//     }
//     // console.log('await  ftx.fetchOHLCV() :>> ', await ftx.fetchOHLCV(symbol, timeframe, since,));
//     // await ftx.createOrders([order])
//     // await ftx.fetchOrders([order])
//     // await ftx.cancelOrders([order])
//     // await ftx.cancelOrders([order])
//     // const ftx2 = new CCXT['ftx']({
//     //     'apiKey': config.FTX.APIKEY,
//     //     'secret': config.FTX.APISECRET,
//     //     'enableRateLimit': true,
//     //     // 'verbose': true,
//     //     'options': { 'adjustForTimeDifference': true }
//     // })
//     // await ftx2.loadMarkets()
//     // console.log('ftx2.createOr`der(order) :>> ', await ftx2.createOrder(symbol, 'limit', 'buy', 0.001, 500));
// })()
