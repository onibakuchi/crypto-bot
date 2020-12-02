import CCXT from 'ccxt';

const event = {
    event: '',
    method: '',
    res: {},
}
const states = {
    fetchOHLCV: 'setPositionStatus',
    setPositionStatus: 'prepareOrder',
    openOrder: 'end',
    events: [
        { state: 'fetchOHLCV', to: 'setPositionStatus' },
        { state: 'setPositionStatus', to: 'prepareOrder' },
        { state: 'openOrder', to: 'end' },
    ]
}
const transite = state => states[state]
interface Mediator {
    notify(sender: object, event: string): void;
    // notifSignal: { success: Boolean, method: String, result: any, }
}
abstract class BaseComponentBot {
    protected mediator: Mediator;

    constructor(mediator: Mediator = null) {
        this.mediator = mediator;
    }

    public setMediator(mediator: Mediator): void {
        this.mediator = mediator;
    }
}

abstract class AbstractClassExchange extends BaseComponentBot {
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
    /**
     * These are "hooks." Subclasses may override them, but it's not mandatory
     * since the hooks already have default (but empty) implementation. Hooks
     * provide additional extension points in some crucial places of the
     * algorithm.
     */
    protected hook1(): void { }

    protected hook2(): void { }
}


/**
 * Concrete classes have to implement all abstract operations of the base class.
 * They can also override some operations with a default implementation.
 */
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

/**
 * Usually, concrete classes override only a fraction of base class' operations.
 */
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

/**
 * The client code calls the template method to execute the algorithm. Client
 * code does not have to know the concrete class of an object it works with, as
 * long as it works with objects through the interface of their base class.
 */
function bot(abstractClass: AbstractClassExchange) {
    // ...
    let symbol, timeframe, since, limit, params;
    abstractClass.fetchOHLCV(symbol, timeframe, since, limit, params);
    // ...
}

class ConcreteMediator2 implements Mediator {
    private component1: AbstractClassExchange;
    private component2: AbstractClassExchange;
    private strategies: AbstractStrategy[] = [];
    private dataStore: DataStore
    private uncontractedOrders = [{ symbol: '', side: '', amount: 1, open_price: 2, }];
    private ohlcv;
    private contractedOrders = [{ symbol: '', side: '', amount: 1, ave_open_price: 2, }]
    constructor() {
        this.component1.setMediator(this);
        this.component2.setMediator(this);
    }

    public notify(sender: object, event: string): void {

    }
    public setComponent(comp: AbstractClassExchange): void { }
    public setStrategy(_strategies: AbstractStrategy[]): void {
        this.strategies.push(new AbstractStrategy())
     }
    private setOHLCV() { }
    private setPositionStatus() { }
    public main() {
        this.hook()
        this.exeStrategy()
    }
    private exeStrategy() {

        for (const strategy of this.strategies) {
            const order = strategy.strategy()
            this.dataStore.storePreparedOrder(order)
        }
    }
    private hook() {
        this.setOHLCV();
        this.setPositionStatus();
    }
    public openOrder() { }
    public closeOrder() { }
    protected update() { }
}

interface DataStore {
    ohlcv
    uncontractedOrders
    contractedOrders
    storePreparedOrder(order): void
}
abstract class AbstractStrategy {
    protected abstract exchangeapi: AbstractClassExchange;
    public setExchangeapi(comp): void { }
    public strategy(): void { }
    public entry() { }
    public exit() { }
    public strategyWhenOrderOpen() { }
    public strategyWhenContracted() { }

}
class Strategy extends AbstractStrategy {
    protected exchangeapi
    constructor(comp) {
        super();
        this.exchangeapi = comp
    }
    public setExchangeapi(comp) {
        this.exchangeapi = comp
    }
    public strategy() {

    }
    public entry() { }
    public exit() { }
    public strategyWhenOrderOpen() { }
    public strategyWhenContracted() { }

}

const ExchangeRepositories = {
    bitbank: ConcreteExchange11,
    ftx: ConcreteExchange22,
}

export const ExchangeRepositoryFactory = {
    get: name => ExchangeRepositories[name]
}

const mediater = new ConcreteMediator2()
console.log('Same client code can work with different subclasses:');
const ftxInstance = new (ExchangeRepositoryFactory.get('ftx'))()
mediater.setComponent(ftxInstance);

bot(new ConcreteExchange11());
console.log('');
console.log('Same client code can work with different subclasses:');
bot(new ConcreteExchange22());