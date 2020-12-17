import { Collection } from 'mongodb';
import { MongoDatastore, CollectionRepository, MongoDatastoreInterface } from './base-mongo-db';
import { Order } from './datastore-interface';
import { BaseDatastore } from './datastore';

export class DatastoreWithMongo extends BaseDatastore {
    db: MongoDatastoreInterface;
    collections: CollectionRepository;
    constructor() {
        super();
        this.db = new MongoDatastore();
    }
    public async init(): Promise<void> {
        if (this.collections.orders == undefined) {
            this.db.addCollection('orders');
        }
        await this.db.connect();
        const data = (await this.db.findDocuments(this.collections.orders, {})) as Order[]
        data.forEach(order => {
            if (('orderName' in order) && ('id' in order)) {
                this.activeOrders.set(order['orderName'], order);
            }
        });
    }
    public async saveToDb() {
        const data = [...this.contractedOrders.values(), ...this.getExpiredOrders()]
        await this.safeCallDb(this.db.bulkUpsert, 0, this.collections.orders, [...this.activeOrders.values()]);
        // await this.safeCallDb(this.db.bulkDelete, 0, this.collections.orders, data);
    }
    private async safeCallDb(func: (arg0: Collection<{ id: string; }>, arg1: Order[]) => any, count?: number, ...args: [any, any]) {
        try {
            return await func(...args);
        } catch (e) {
            console.log('[ERROR]:FAILED_DB_REQUEST', e);
            this.pushMessage(e)
            if (!(e instanceof TypeError) && count <= 5) {
                console.log('[Info]:Retry...');
                await this.safeCallDb(func, count + 1, ...args);
            }
        }
    }

}