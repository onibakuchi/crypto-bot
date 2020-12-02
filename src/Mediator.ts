import { AbstractClassExchange } from './Exchanges';
import { Strategy } from './Strategy';
import { DataStoreInterface } from './DataStore';

export interface Mediator {
    notify(sender: object, event: string): void;
    // notifSignal: { success: Boolean, method: String, result: any, }
}

export class ConcreteMediator2 implements Mediator {
    private exchangeapi: AbstractClassExchange;
    private component2: AbstractClassExchange;
    private strategies: Strategy[] = [];
    private dataStore: DataStoreInterface
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
