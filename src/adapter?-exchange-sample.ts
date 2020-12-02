/**
 * The Abstract Class defines a template method that contains a skeleton of some
 * algorithm, composed of calls to (usually) abstract primitive operations.
 *
 * Concrete subclasses should implement these operations, but leave the template
 * method itself intact.
 */
abstract class AbstractExchangeClass {
    /**
     * The template method defines the skeleton of an algorithm.
     */
    public templateMethod(): void {
        this.baseOperation1();
        this.fetchOHLCV();
        this.baseOperation2();
        this.hook1();
        this.requiredOperation2();
        this.baseOperation3();
        this.hook2();
    }

    /**
     * These operations already have implementations.
     */
    protected baseOperation1(): void {
        console.log('AbstractExchangeClass says: I am doing the bulk of the work');
    }

    protected baseOperation2(): void {
        console.log('AbstractExchangeClass says: But I let subclasses override some operations');
    }

    protected baseOperation3(): void {
        console.log('AbstractExchangeClass says: But I am doing the bulk of the work anyway');
    }

    /**
     * These operations have to be implemented in subclasses.
     */
    public abstract fetchOHLCV(): void;

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
class ConcreteExchange1 extends AbstractExchangeClass {
    public fetchOHLCV(): void {
        console.log('ConcreteExchange1 says: Implemented Operation1');
    }

    protected requiredOperation2(): void {
        console.log('ConcreteExchange1 says: Implemented Operation2');
    }
}

/**
 * Usually, concrete classes override only a fraction of base class' operations.
 */
class ConcreteExchange2 extends AbstractExchangeClass {
    public fetchOHLCV(): void {
        console.log('ConcreteExchange2 says: Implemented Operation1');
    }

    protected requiredOperation2(): void {
        console.log('ConcreteExchange2 says: Implemented Operation2');
    }

    protected hook1(): void {
        console.log('ConcreteExchange2 says: Overridden Hook1');
    }
}

/**
 * The client code calls the template method to execute the algorithm. Client
 * code does not have to know the concrete class of an object it works with, as
 * long as it works with objects through the interface of their base class.
 */
function clientCode1(abstractClass: AbstractExchangeClass) {
    // ...
    abstractClass.fetchOHLCV();
    // ...
}

console.log('Same client code can work with different subclasses:');
clientCode1(new ConcreteExchange1());
console.log('');

console.log('Same client code can work with different subclasses:');
clientCode1(new ConcreteExchange2());