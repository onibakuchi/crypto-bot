import CCXT from 'ccxt';
import type { Order, Position } from '../datastore/datastore-interface';
import { BaseComponent, Mediator } from '../bot/bot-interface';
import config from '../config/config';

export abstract class AbstractExchange extends BaseComponent {
    protected CCXT: CCXT.Exchange;
    protected abstract exchangeId: string;
    private maxRetry: number = 1;
    protected readonly ONLY_PUBLIC: Boolean = false;
    constructor(mediator: Mediator = null) {
        super(mediator);
    }
    public abstract fetchPosition(symbol?, params?): Promise<any>;
    protected setCCXT = (): void => {
        const keys = this.setKey(this.exchangeId);
        this.CCXT = new CCXT[this.exchangeId.toLowerCase()]({
            'apiKey': keys?.APIKEY,
            'secret': keys?.APISECRET,
            'enableRateLimit': true,
            // 'verbose': true,
            'options': { 'adjustForTimeDifference': true }
        })
    }
    private setKey(exchangeId: string) {
        if (this.ONLY_PUBLIC) return
        if (config[exchangeId.toUpperCase()]["APIKEY"] && config[exchangeId.toUpperCase()]["APISECRET"]) {
            return {
                'APIKEY': config[exchangeId.toUpperCase()]["APIKEY"],
                'APISECRET': config[exchangeId.toUpperCase()]["APISECRET"]
            }
        } else throw Error(`[ERROR]:CANNOT_FIND_${this.exchangeId.toUpperCase()}_APIKEYS`)
    }
    protected updateOrder(target: Order, source: CCXT.Order) {
        target.status = source.status ? source.status : 'pending';
        source.id && (target.id = source.id);
        source.timestamp && (target.timestamp = source.timestamp);
    }
    // protected abstract handleError(e: Error, order: Order): void;
    public async createOrder(order: Order, counts = 0): Promise<Order> {
        try {
            const { id, symbol, type, side, amount, price, params } = order;
            const res = await this.CCXT.createOrder(symbol, type, side, amount, price, params);
            this.updateOrder(order, res);
            console.log(res);
        } catch (e) {
            console.log('[ERROR]:function CreateOrder\n', e);
            if (counts <= 1) {
                console.log('[Info]:Retry...');
                await this.createOrder(order, counts++);
            } else console.log('[ERROR]:Retry Failed');
        }
        return order
    }
    public async createOrders(orders: IterableIterator<Order>, counts?: number): Promise<Order[]>
    public async createOrders(orders: Order[], counts?: number): Promise<Order[]>
    public async createOrders(orders: any, counts = 0): Promise<Order[]> {
        console.log('[Info]:Calling function createOrders...');
        for (const order of orders) {
            try {
                const { id, symbol, type, side, amount, price, params } = order;
                if (symbol == undefined) throw TypeError('BadSymbol:symbol is undefined');
                await new Promise((resolve) => setTimeout(resolve, 1000))
                const res = await this.CCXT.createOrder(symbol, type, side, amount, price, params);
                this.updateOrder(order, res);
                console.log('[Info]:Success... Created a order <Order> :>>', order);
            } catch (e) {
                console.log('[ERROR]:function CreateOrders\n', e);
                if (e instanceof TypeError) {
                    console.log('[ERROR]: INVALID_ORDER_PROPERTY <Order>:>>', order);
                    continue;
                }
                await this.pushMessage(JSON.stringify(e));
                if (counts >= this.maxRetry) {
                    console.log('[ERROR]:Retry Failed');
                } else {
                    console.log('[Info]:Retry...');
                    await this.createOrders([order], counts + 1);
                }
                // if (counts <= this.maxRetry) {
                //     console.log('[Info]:Retry...');
                //     await this.createOrders([order], counts++);
                // } else console.log('[ERROR]:Retry Failed');
            }
        }
        return orders
    }
    public async cancelOrder(e: Error, order: Order) { }
    public async cancelOrders(orders: Order[], counts = 0): Promise<Order[]> {
        console.log('[Info]:Calling function cancelOrders...');
        for (const order of orders) {
            try {
                const { id, symbol, type, side, amount, price, params } = order;
                await new Promise((resolve) => setTimeout(resolve, 1000))
                const res = await this.CCXT.cancelOrder(id, symbol, params);
                this.updateOrder(order, res);
                console.log('[Info]: Success.. Canceled order <Order>', order);
            } catch (e) {
                console.log('[ERROR]:function cancelOrders\n', e);
                if (counts <= this.maxRetry) {
                    console.log('[Info]:Retry...');
                    await this.cancelOrders([order], counts + 1);
                } else console.log('[ERROR]:Retry Failed');
            }
        }
        return orders
    }
    public async fetchOHLCV(symbol, timeframe, since, limit?, params?, counts = 0): Promise<number[][]> {
        try {
            return await this.CCXT.fetchOHLCV(symbol, timeframe, since, limit, params);
        } catch (e) {
            console.log('[ERROR]:function fetchOHLCV', e);
            if (counts <= this.maxRetry) {
                await this.fetchOHLCV(symbol, timeframe, since, limit, params, counts + 1);
                console.log('[Info]:Retry...');
            } else console.log('[ERROR]:Retry Failed');
        }
    }
    public async fetchOrders(orders: IterableIterator<Order>, counts?: number): Promise<Order[]>
    public async fetchOrders(orders: Order[], counts?: number): Promise<Order[]>
    public async fetchOrders(orders: any, counts = 0): Promise<Order[]> {
        console.log(`[Info]: Fetch order status under the managment via Exchange API...`);
        for (const order of orders) {
            try {
                const { id, symbol, type, side, amount, price, params } = order;
                await new Promise((resolve) => setTimeout(resolve, 1000))
                const res = await this.CCXT.fetchOrder(id, symbol, params);
                this.updateOrder(order, res);
            } catch (e) {
                console.log('[ERROR]:function fetchOrders\n', e);
                if (counts <= this.maxRetry) {
                    console.log('[Info]:Retry...');
                    await this.fetchOrders([order], counts + 1);
                } else console.log('[ERROR]:Retry Failed');
            }
        }
        return orders
    }
    public async fetchTickers(symbols: string[], params?: CCXT.Params): Promise<{ [symbol: string]: CCXT.Ticker }> {
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

class BitBank extends AbstractExchange {
    protected exchangeId = 'bitbank';
    protected readonly ONLY_PUBLIC = true;
    constructor(mediator = null) {
        super(mediator);
        this.setCCXT();
    }
    public async fetchPosition() { return Promise.reject() }
}

class FTX extends AbstractExchange {
    protected exchangeId: string = 'ftx';
    constructor(mediator = null) {
        super(mediator);
        this.setCCXT();
    }
    public async fetchPosition(symbol = undefined, params = {}): Promise<any> {
        const data = this.CCXT.fetchPositions(params);
        for (const d of data) {
            if (d.future = symbol) {
                const position: Position = {
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
    protected readonly ONLY_PUBLIC = true;
    protected exchangeId: string = 'coincheck';
    constructor(mediator = null) {
        super(mediator);
        this.setCCXT();
    }
    public async fetchPosition() { return Promise.reject(); }
}

const ExchangeRepositories: {
    [exchange: string]: AbstractExchange
} = {
    'bitbank': new BitBank(),
    'coincheck': new CoinCheck(),
    'ftx': new FTX(),
    // 'bitmex': new BitMEX(),
}


export const ExchangeRepositoryFactory = {
    get: (name: string) => ExchangeRepositories[name]
};

(async () => {
    const ftx = ExchangeRepositoryFactory.get('ftx');
    const res = await ftx.fetchPosition();
    console.log('res :>> ', res);
})()
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