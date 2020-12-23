"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ccxt_1 = __importDefault(require("ccxt"));
/**
 * The Abstraction defines the interface for the "control" part of the two class
 * hierarchies. It maintains a reference to an object of the Implementation
 * hierarchy and delegates all of the real work to this object.
 */
class AbstractionExchange {
    constructor(implementation) {
        this.implementation = implementation;
    }
    fetchOHLCV() {
        const result = this.implementation.fetchOHLCV();
        this.mediator.notify(this, 'e');
        return `Abstraction: Base operation with:\n${result}`;
    }
}
/**
 * You can extend the Abstraction without changing the ImplementationExchange classes.
 */
class ExtendedAbstractionExchange extends AbstractionExchange {
    ohlcv() {
        const result = this.implementation.fetchOHLCV();
        return `ExtendedAbstraction: Extended operation with:\n${result}`;
    }
}
class BaseExchange {
    constructor() {
        this.setCCXT();
    }
    setCCXT() {
        // ({ "apikey": APIKEY, "apisecret": APISECRET } = config[exchangeId.toUpperCase()]);
        this.CCXT = new ccxt_1.default[this.exchangeId]({});
    }
}
class BitMex extends BaseExchange {
}
class BitBank {
    constructor() {
        this.setCCXT();
    }
    setCCXT() {
        // ({ "apikey": APIKEY, "apisecret": APISECRET } = config[exchangeId.toUpperCase()]);
        this.CCXT = new ccxt_1.default[this.exchangeId]({});
    }
    fetchOHLCV() {
        this.CCXT.fetchOHLCV();
        return 'ConcreteImplementationA: Here\'s the result on the platform A.';
    }
}
class FTX {
    constructor() {
        this.setCCXT();
    }
    setCCXT() {
        // ({ "apikey": APIKEY, "apisecret": APISECRET } = config[exchangeId.toUpperCase()]);
        this.CCXT = new ccxt_1.default[this.exchangeId]({});
    }
    fetchOHLCV() {
        return 'ConcreteImplementationB: Here\'s the result on the platform B.';
    }
}
/**
 * Except for the initialization phase, where an Abstraction object gets linked
 * with a specific Implementation object, the client code should only depend on
 * the Abstraction class. This way the client code can support any abstraction-
 * implementation combination.
 */
function clientCode(abstraction) {
    // ..
    console.log(abstraction.fetchOHLCV());
    // ..
}
{
    /**
     * The client code should be able to work with any pre-configured abstraction-
     * implementation combination.
     */
    let implementation = new FTX();
    let abstraction = new AbstractionExchange(implementation);
    clientCode(abstraction);
    // console.log('');
    // implementation = new ConcreteImplementationB();
    // abstraction = new ExtendedAbstraction(implementation);
    // clientCode(abstraction);
}
