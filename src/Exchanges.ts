import CCXT from 'ccxt';
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
    public async fetchOHLCV(symbol, timeframe, since, limit, params) {
        try {
            return this._fetchOHLCV(symbol, timeframe, since, limit, params);
        } catch (e) {
        }
    }
    public async cancelOrder(order: Order) {
        this._cancelOrder(order);
    }
    public async fetchContractedOrder(order) {
        this._cancelOrder(order);
    }
    public async cancelOrders(order) {
        this._cancelOrder(order);
    }
    public async createOrder(order) {
        this._cancelOrder(order);
    }
    public async createOrders(order) {
        this._cancelOrder(order);
    }
    public abstract async fetchOrders(orders)
    protected abstract async _fetchOHLCV(symbol, timeframe, since, limit, params): Promise<void>;
    protected abstract async _cancelOrder(order)
}

class ConcreteExchange11 extends AbstractClassExchange {
    protected exchangeId = 'bitbank'
    protected async _fetchOHLCV(symbol, timeframe, since?, limit?, params?) {
        this.CCXT.fetchOHLCV(symbol, timeframe, since, limit, params)
        console.log('ConcreteExchange11 says: Implemented Operation1');
    }
}

class ConcreteExchange22 extends AbstractClassExchange {
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