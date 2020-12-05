import { strict } from 'assert';
import CCXT from 'ccxt';
import { type } from 'os';
import { start } from 'repl';
import { symbolName } from 'typescript';
import { Order } from './DataStore';

export abstract class BaseComponentBot {
    protected mediator: Mediator;

    constructor(mediator: Mediator = null) {
        this.mediator = mediator;
    }

    public setMediator(mediator: Mediator): void {
        this.mediator = mediator;
    }
}

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
    public async fetchOHLCV(symbol, timeframe, since, limit, params, counts = 0) {
        try {
            await this.CCXT.fetchOHLCV(symbol, timeframe, since, limit, params);
        } catch (e) {
            console.log('[ERROR]:');
            console.log('[Info]:Retry...');
            await this.fetchOHLCV(symbol, timeframe, since, limit, params, counts++);
        }
    }
    public async fetchOrders(orders: IterableIterator<Order>): Promise<void>
    public async fetchOrders(orders: Order[]): Promise<void>
    public async fetchOrders(orders: any): Promise<void> {
        for (const order of orders) {
            const { id, symbol, type, side, amount, price, params } = order;
            await new Promise((resolve) => setTimeout(resolve, 1000))
            const res = await this.CCXT.fetchOrder(id, symbol, params);
            console.log(res);
            order.status = res.status;
        }
    }
    public async fetchContractedOrder(order) { }

    public async cancelOrder(order: Order) { }
    public async cancelOrders(order) { }

    public async createOrder(order) { }
    public async createOrders(orders: Order[]) {
        for (const order of orders) {
            const { id, symbol, type, side, amount, price, params } = order;
            await new Promise((resolve) => setTimeout(resolve, 1000))
            const res = await this.CCXT.createOrder(symbol, type, side, amount, price, params);
            console.log(res);
            order.status = res.status;
        }
        return orders
    }
}

class ConcreteExchange11 extends AbstractClassExchange {
    public async fetchOrders(orders: any) { }
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
    public async fetchOrders(orders: any): Promise<void> {
        throw new Error('Method not implemented.');
    }
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