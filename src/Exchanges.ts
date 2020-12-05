import CCXT from 'ccxt';
import { Order } from './DataStore';
import { BaseComponentBot, Mediator } from './Mediator';

export abstract class AbstractClassExchange extends BaseComponentBot {
    protected CCXT: CCXT.Exchange;
    protected abstract exchangeId: string;
    constructor(mediator: Mediator = null) {
        super(mediator);
        this.setCCXT();
    }
    private setCCXT(): void {
        // ({ "apikey": APIKEY, "apisecret": APISECRET } = config[exchangeId.toUpperCase()]);
        this.CCXT = new CCXT[this.exchangeId]({})
    }
    public async createOrder(order) { }
    public async createOrders(orders: Order[], counts = 0): Promise<Order[]> {
        for (const order of orders) {
            try {
                const { id, symbol, type, side, amount, price, params } = order;
                await new Promise((resolve) => setTimeout(resolve, 1000))
                const res = await this.CCXT.createOrder(symbol, type, side, amount, price, params);
                order.status = res.status;
                console.log(res);
            } catch (e) {
                console.log('[ERROR]:function CreateOrders', e);
                if (counts < 1) {
                    console.log('[Info]:Retry...');
                    await this.createOrders([order], counts++);
                } else console.log('[ERROR]:Retry Failed');
            }
        }
        return orders
    }

    public async cancelOrder(order: Order) { }
    public async cancelOrders(orders: Order[], counts = 0): Promise<Order[]> {
        for (const order of orders) {
            try {
                const { id, symbol, type, side, amount, price, params } = order;
                await new Promise((resolve) => setTimeout(resolve, 1000))
                const res = await this.CCXT.cancelOrder(id, symbol, params);
                order.status = res.status;
                console.log(res);
            } catch (e) {
                console.log('[ERROR]:function cancelOrders', e);
                if (counts < 1) {
                    console.log('[Info]:Retry...');
                    await this.createOrders([order], counts++);
                } else console.log('[ERROR]:Retry Failed');
            }
        }
        return orders
    }
    public async fetchOHLCV(symbol, timeframe, since, limit, params, counts = 0): Promise<number[][]> {
        try {
            return await this.CCXT.fetchOHLCV(symbol, timeframe, since, limit, params);
        } catch (e) {
            console.log('[ERROR]:function fetchOHLCV', e);
            if (counts < 1) {
                await this.fetchOHLCV(symbol, timeframe, since, limit, params, counts++);
                console.log('[Info]:Retry...');
            } else console.log('[ERROR]:Retry Failed');
        }
    }
    public async fetchOrders(orders: IterableIterator<Order>): Promise<Order[]>
    public async fetchOrders(orders: Order[]): Promise<Order[]>
    public async fetchOrders(orders: any): Promise<Order[]> {
        for (const order of orders) {
            const { id, symbol, type, side, amount, price, params } = order;
            await new Promise((resolve) => setTimeout(resolve, 1000))
            const res = await this.CCXT.fetchOrder(id, symbol, params);
            console.log(res);
            order.status = res.status;
        }
        return orders
    }
}

class ConcreteExchange11 extends AbstractClassExchange {
    protected _cancelOrder(order: any) {
        throw new Error('Method not implemented.');
    }
    protected exchangeId = 'bitbank'
    protected async _fetchOHLCV(symbol, timeframe, since?, limit?, params?) {
        this.CCXT.fetchOHLCV(symbol, timeframe, since, limit, params)
        console.log('ConcreteExchange11 says: Implemented Operation1');
    }
}

class ConcreteExchange22 extends AbstractClassExchange {
    protected _cancelOrder(order: any) {
        throw new Error('Method not implemented.');
    }
    protected exchangeId = 'ftx'
    protected async _fetchOHLCV() {
        console.log('ConcreteExchange22 says: Implementeation1');
    }
}

const ExchangeRepositories = {
    bitbank: ConcreteExchange11,
    ftx: ConcreteExchange22,
}

export const ExchangeRepositoryFactory = {
    get: name => ExchangeRepositories[name]
}