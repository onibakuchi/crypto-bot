import { AbstractClassExchange } from './Exchanges';
import { DataStoreInterface } from './DataStore';

abstract class AbstractStrategy {
    protected abstract exchangeapi: AbstractClassExchange;
    protected abstract datastore: DataStoreInterface;
    public setExchangeapi(comp): void { }
    public setDataStore(comp): void { }
    public strategy(): void {
        const status = this.datastore.getStatus()
        if (status == 'Position') {
            return this.exit()
        }
        if (status == 'ActiveOrder') return this.strategyWhenOrderOpen()
        if (status == 'Await') return this.entry()
        if (status == 'Error') return
    }
    public entry() { }
    public exit() { }
    public strategyWhenOrderOpen() { }
    public strategyWhenContracted() { }
}
export class Strategy extends AbstractStrategy {
    protected exchangeapi: AbstractClassExchange
    protected datastore: DataStoreInterface
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
