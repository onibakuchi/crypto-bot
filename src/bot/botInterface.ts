import { DatastoreInterface, Order } from "../datastore/datastoreInterface";
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
    main(): Promise<void>;
    saveToDb(): void;
    setDatastore(Datastore: new () => DatastoreInterface): void;
}