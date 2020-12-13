import { DatastoreInterface, Order } from "../datastore/datastoreInterface";

export abstract class BaseComponent {
    protected mediator: Mediator;

    constructor(mediator: Mediator = null) {
        this.mediator = mediator;
    }

    public setMediator(mediator: Mediator): void {
        this.mediator = mediator;
    }
}

export interface Mediator {
    getDatastore(): DatastoreInterface;
    getOrders(kind: 'prepared' | 'active' | 'contracted'): IterableIterator<Order>;
    init(): Promise<void>;
    main(): Promise<void>;
    setDatastore(Datastore: new () => DatastoreInterface): void;
}