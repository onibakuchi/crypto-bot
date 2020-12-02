import CCXT from 'ccxt';
/** 
 * The Abstraction defines the interface for the "control" part of the two class
 * hierarchies. It maintains a reference to an object of the Implementation
 * hierarchy and delegates all of the real work to this object.
 */
class AbstractionExchange {
    protected implementation: ImplementationExchange;
    protected mediator: Mediator

    constructor(implementation: ImplementationExchange) {
        this.implementation = implementation;
    }

    public fetchOHLCV(): string {
        const result = this.implementation.fetchOHLCV();
        this.mediator.notify(this, 'e')
        return `Abstraction: Base operation with:\n${result}`;
    }
}

/**
 * You can extend the Abstraction without changing the ImplementationExchange classes.
 */
class ExtendedAbstractionExchange extends AbstractionExchange {
    public ohlcv(): string {
        const result = this.implementation.fetchOHLCV();
        return `ExtendedAbstraction: Extended operation with:\n${result}`;
    }
}

/**
 * The Implementation defines the interface for all implementation classes. It
 * doesn't have to match the Abstraction's interface. In fact, the two
 * interfaces can be entirely different. Typically the Implementation interface
 * provides only primitive operations, while the Abstraction defines higher-
 * level operations based on those primitives.
 */
interface ImplementationExchange {
    CCXT;
    fetchOHLCV(): string;
}
abstract class BaseExchange {
    exchangeId;
    CCXT;
    constructor() {
        this.setCCXT();
    }
    private setCCXT(): void {
        // ({ "apikey": APIKEY, "apisecret": APISECRET } = config[exchangeId.toUpperCase()]);
        this.CCXT = new CCXT[this.exchangeId]({})
    }
}
class BitMex extends BaseExchange {}
class BitBank implements ImplementationExchange {
    exchangeId;
    CCXT;
    constructor() {
        this.setCCXT();
    }
    private setCCXT(): void {
        // ({ "apikey": APIKEY, "apisecret": APISECRET } = config[exchangeId.toUpperCase()]);
        this.CCXT = new CCXT[this.exchangeId]({})
    }
    public fetchOHLCV(): string {
        this.CCXT.fetchOHLCV()
        return 'ConcreteImplementationA: Here\'s the result on the platform A.';
    }
}

class FTX implements ImplementationExchange {
    exchangeId;
    CCXT;
    constructor() {
        this.setCCXT();
    }
    private setCCXT(): void {
        // ({ "apikey": APIKEY, "apisecret": APISECRET } = config[exchangeId.toUpperCase()]);
        this.CCXT = new CCXT[this.exchangeId]({})
    }
    public fetchOHLCV(): string {
        return 'ConcreteImplementationB: Here\'s the result on the platform B.';
    }
}

/**
 * Except for the initialization phase, where an Abstraction object gets linked
 * with a specific Implementation object, the client code should only depend on
 * the Abstraction class. This way the client code can support any abstraction-
 * implementation combination.
 */
function clientCode(abstraction: AbstractionExchange) {
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