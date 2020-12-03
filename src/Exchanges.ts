import CCXT from 'ccxt';
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
    cancelOrder(): any {
        throw new Error('Method not implemented.');
    }
    createOrder() {
        throw new Error('Method not implemented.');
    }
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
    public fetchOHLCV(symbol, timeframe, since, limit, params): void {
        console.log('AbstractClassExchange says: I am doing the bulk of the work');
        try {
            const ohlcv = this._fetchOHLCV(symbol, timeframe, since, limit, params);
            this.mediator.notify(this, 'fetchOHLCV')
            return ohlcv
        } catch (e) {
            this.mediator.notify(this, 'fetchOHLCV')
        }
    }
    protected baseOperation2(): void {
        console.log('AbstractClassExchange says: But I let subclasses override some operations');
    }
    protected abstract _fetchOHLCV(symbol, timeframe, since, limit, params): void;
    protected abstract requiredOperation2(): void;
    protected hook1(): void { }

    protected hook2(): void { }
}

class ConcreteExchange11 extends AbstractClassExchange {
    protected exchangeId = 'bitbank'
    protected _fetchOHLCV(symbol, timeframe, since?, limit?, params?): void {
        this.CCXT.fetchOHLCV(symbol, timeframe, since, limit, params)
        console.log('ConcreteExchange11 says: Implemented Operation1');
    }

    protected requiredOperation2(): void {
        console.log('ConcreteExchange11 says: Implemented Operation2');
    }
}

class ConcreteExchange22 extends AbstractClassExchange {
    protected exchangeId = 'ftx'
    protected _fetchOHLCV(): void {
        console.log('ConcreteExchange22 says: Implemented Operation1');
    }

    protected requiredOperation2(): void {
        console.log('ConcreteExchange22 says: Implemented Operation2');
    }

    protected hook1(): void {
        console.log('ConcreteExchange22 says: Overridden Hook1');
    }
}

const ExchangeRepositories = {
    bitbank: ConcreteExchange11,
    ftx: ConcreteExchange22,
}

export const ExchangeRepositoryFactory = {
    get: name => ExchangeRepositories[name]
}