import { DatastoreInterface, Order } from "../datastore/datastore-interface";
import { pushMessage } from '../line';

export abstract class BaseComponent {
    protected mediator: Mediator;

    constructor(mediator: Mediator = null) {
        this.mediator = mediator;
    }

    public setMediator(mediator: Mediator): void {
        this.mediator = mediator;
    }
    protected async pushMessage(message: string) {
        await pushMessage(message);
    }
}

export interface Mediator {
    getDatastore(): DatastoreInterface;
    getOrders(kind: 'prepared' | 'active' | 'contracted'): IterableIterator<Order>;
    init(): Promise<void>;
    main(): Promise<Order[]>;
    saveToDb(): void;
    setDatastore(Datastore: new () => DatastoreInterface): void;
}

export abstract class BaseStrategy extends BaseComponent {
    public abstract strategy(): Order[]
}

