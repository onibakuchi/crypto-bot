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

function bot(abstractClass: AbstractClassExchange) {
    let symbol, timeframe, since, limit, params;
    abstractClass.fetchOHLCV(symbol, timeframe, since, limit, params);
}

class ConcreteMediator2 implements Mediator {
    private exchangeapi: AbstractClassExchange;
    private component2: AbstractClassExchange;
    private strategies: Strategy[] = [];
    private dataStore: DataStore
    constructor() {
        this.exchangeapi.setMediator(this);
        this.component2.setMediator(this);
    }
    public notify(sender: object, event: string): void {

    }
    public setComponent(comp: AbstractClassExchange): void { }
    public setStrategy(_strategies: Strategy[]): void {
        this.strategies.push(new Strategy(this.exchangeapi, this.dataStore))
    }
    private setOHLCV() {
        const ohlcv = this.exchangeapi.fetchOHLCV('USD', '1h', 1, 1, 1)
        this.dataStore.ohlcv = ohlcv;
    }
    private setPositionStatus() {
        const positon = this.exchangeapi
        this.dataStore.setContractedOrder(positon)
    }
    public main() {
        this.hook()
        this.exeStrategy()
    }
    private exeStrategy() {
        for (const strategy of this.strategies) {
            const order = strategy.strategy()
            this.dataStore.setPreparedOrder(order)
        }
    }
    private hook() {
        this.setOHLCV();
        this.setPositionStatus();
    }
    public async order() {
        const orders = this.dataStore.getPreparedOrder()
        for (const orderObj of orders) {
            const promise = new Promise((resolve) => setTimeout(resolve, 1000))
            promise.then(() => this.exchangeapi.createOrder())
        }
    }
    public update(status) {
        const switcher = {
            'Error': () => 1,
            'OpenOrder': (param) => {
                this.dataStore.setOpenedOrder(param);
                // this.dataStore.setStatus()
            },
            'Contracted': (status) => {
                this.dataStore.setStatus(status);
            },
        }
        return switcher[status]()
    }
}

interface DataStore {
    ohlcv
    uncontractedOrders
    contractedOrders
    openedOrder
    status: 'Contracted' | 'OpenOrder' | 'Await' | 'Error'
    getStatus(): 'Contracted' | 'OpenOrder' | 'Await' | 'Error'
    setStatus(status): void
    setPreparedOrder(order): void
    getPreparedOrder(): void
    setOpenedOrder(oder): void
    getOpenedOrder(): void
    setUncontractedOrder(oder): void
    getUncontractedOrder(): void
    setContractedOrder(oder): void
    getContractedOrder(): void
}
abstract class AbstractStrategy {
    protected abstract exchangeapi: AbstractClassExchange;
    protected abstract datastore: DataStore;
    public setExchangeapi(comp): void { }
    public setDataStore(comp): void { }
    public strategy(): void {
        const status = this.datastore.getStatus()
        if (status == 'Contracted') {
            if (1) return this.pyramiding();
            return this.exit()
        }
        if (status == 'OpenOrder') return this.strategyWhenOrderOpen()
        if (status == 'Await') return this.entry()
        if (status == 'Error') return
    }
    public entry() { }
    public exit() { }
    public strategyWhenOrderOpen() { }
    public pyramiding() { }
    public strategyWhenContracted() { }
}
class Strategy extends AbstractStrategy {
    protected exchangeapi: AbstractClassExchange
    protected datastore: DataStore
    constructor(comp, comp2) {
        super();
        this.exchangeapi = comp
        this.datastore = comp2
    }
    public setExchangeapi(comp) {
        this.exchangeapi = comp
    }
    public setDataStore(comp): void { }
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