"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExchangeRepositoryFactory = void 0;
const ccxt_1 = __importDefault(require("ccxt"));
const event = {
    event: '',
    method: '',
    res: {},
};
const states = {
    fetchOHLCV: 'setPositionStatus',
    setPositionStatus: 'prepareOrder',
    openOrder: 'end',
    events: [
        { state: 'fetchOHLCV', to: 'setPositionStatus' },
        { state: 'setPositionStatus', to: 'prepareOrder' },
        { state: 'openOrder', to: 'end' },
    ]
};
const transite = state => states[state];
class BaseComponentBot {
    constructor(mediator = null) {
        this.mediator = mediator;
    }
    setMediator(mediator) {
        this.mediator = mediator;
    }
}
class AbstractClassExchange extends BaseComponentBot {
    constructor(mediator = null) {
        super(mediator);
        this.setCCXT();
    }
    createOrder() {
        throw new Error('Method not implemented.');
    }
    setCCXT() {
        // ({ "apikey": APIKEY, "apisecret": APISECRET } = config[exchangeId.toUpperCase()]);
        this.CCXT = new ccxt_1.default[this.exchangeId]({});
    }
    fetchOHLCV(symbol, timeframe, since, limit, params) {
        console.log('AbstractClassExchange says: I am doing the bulk of the work');
        try {
            const ohlcv = this._fetchOHLCV(symbol, timeframe, since, limit, params);
            this.mediator.notify(this, 'fetchOHLCV');
            return ohlcv;
        }
        catch (e) {
            this.mediator.notify(this, 'fetchOHLCV');
        }
    }
    baseOperation2() {
        console.log('AbstractClassExchange says: But I let subclasses override some operations');
    }
    /**
     * These are "hooks." Subclasses may override them, but it's not mandatory
     * since the hooks already have default (but empty) implementation. Hooks
     * provide additional extension points in some crucial places of the
     * algorithm.
     */
    hook1() { }
    hook2() { }
}
/**
 * Concrete classes have to implement all abstract operations of the base class.
 * They can also override some operations with a default implementation.
 */
class ConcreteExchange11 extends AbstractClassExchange {
    constructor() {
        super(...arguments);
        this.exchangeId = 'bitbank';
    }
    _fetchOHLCV(symbol, timeframe, since, limit, params) {
        this.CCXT.fetchOHLCV(symbol, timeframe, since, limit, params);
        console.log('ConcreteExchange11 says: Implemented Operation1');
    }
    requiredOperation2() {
        console.log('ConcreteExchange11 says: Implemented Operation2');
    }
}
/**
 * Usually, concrete classes override only a fraction of base class' operations.
 */
class ConcreteExchange22 extends AbstractClassExchange {
    constructor() {
        super(...arguments);
        this.exchangeId = 'ftx';
    }
    _fetchOHLCV() {
        console.log('ConcreteExchange22 says: Implemented Operation1');
    }
    requiredOperation2() {
        console.log('ConcreteExchange22 says: Implemented Operation2');
    }
    hook1() {
        console.log('ConcreteExchange22 says: Overridden Hook1');
    }
}
function bot(abstractClass) {
    let symbol, timeframe, since, limit, params;
    abstractClass.fetchOHLCV(symbol, timeframe, since, limit, params);
}
class ConcreteMediator2 {
    constructor() {
        this.strategies = [];
        this.exchangeapi.setMediator(this);
        this.component2.setMediator(this);
    }
    notify(sender, event) {
    }
    setComponent(comp) { }
    setStrategy(_strategies) {
        this.strategies.push(new Strategy(this.exchangeapi, this.dataStore));
    }
    setOHLCV() {
        const ohlcv = this.exchangeapi.fetchOHLCV('USD', '1h', 1, 1, 1);
        this.dataStore.ohlcv = ohlcv;
    }
    setPositionStatus() {
        const positon = this.exchangeapi;
        this.dataStore.setContractedOrder(positon);
    }
    main() {
        this.hook();
        this.exeStrategy();
    }
    exeStrategy() {
        for (const strategy of this.strategies) {
            const order = strategy.strategy();
            this.dataStore.setPreparedOrder(order);
        }
    }
    hook() {
        this.setOHLCV();
        this.setPositionStatus();
    }
    async order() {
        const orders = this.dataStore.getPreparedOrder();
        for (const orderObj of orders) {
            const promise = new Promise((resolve) => setTimeout(resolve, 1000));
            promise.then(() => this.exchangeapi.createOrder());
        }
    }
    update(status) {
        const switcher = {
            'Error': () => 1,
            'OpenOrder': (param) => {
                this.dataStore.setOpenedOrder(param);
                // this.dataStore.setStatus()
            },
            'Contracted': (status) => {
                this.dataStore.setStatus(status);
            },
        };
        return switcher[status]();
    }
}
class AbstractStrategy {
    setExchangeapi(comp) { }
    setDataStore(comp) { }
    strategy() {
        const status = this.datastore.getStatus();
        if (status == 'Contracted') {
            if (1)
                return this.pyramiding();
            return this.exit();
        }
        if (status == 'OpenOrder')
            return this.strategyWhenOrderOpen();
        if (status == 'Await')
            return this.entry();
        if (status == 'Error')
            return;
    }
    entry() { }
    exit() { }
    strategyWhenOrderOpen() { }
    pyramiding() { }
    strategyWhenContracted() { }
}
class Strategy extends AbstractStrategy {
    constructor(comp, comp2) {
        super();
        this.exchangeapi = comp;
        this.datastore = comp2;
    }
    setExchangeapi(comp) {
        this.exchangeapi = comp;
    }
    setDataStore(comp) { }
    entry() { }
    exit() { }
    strategyWhenOrderOpen() { }
    strategyWhenContracted() { }
}
const ExchangeRepositories = {
    bitbank: ConcreteExchange11,
    ftx: ConcreteExchange22,
};
exports.ExchangeRepositoryFactory = {
    get: name => ExchangeRepositories[name]
};
const mediater = new ConcreteMediator2();
console.log('Same client code can work with different subclasses:');
const ftxInstance = new (exports.ExchangeRepositoryFactory.get('ftx'))();
mediater.setComponent(ftxInstance);
bot(new ConcreteExchange11());
console.log('');
console.log('Same client code can work with different subclasses:');
bot(new ConcreteExchange22());
