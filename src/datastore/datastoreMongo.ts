import { Collection } from 'mongodb';
import { MyMongoDb, CollectionRepository, MongoDatastore } from './myMongodb';
import { BaseDatastore, Order } from './datastore';
import { pushMessage } from '../line';

export class DatastoreWithMongo extends BaseDatastore {
    db: MongoDatastore;
    collections: CollectionRepository;
    constructor() {
        super();
        this.db = new MyMongoDb();
    }
    public async init(): Promise<void> {
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
        await this.safeCallDb(this.db.bulkDelete, 0, this.collections.orders, data);
    }
    private async safeCallDb(func: (arg0: Collection<{ id: string; }>, arg1: Order[]) => any, count?: number, ...args: [any, any]) {
        try {
            return await func(...args);
        } catch (e) {
            console.log('[ERROR]:FAILED_DB_REQUEST', e);
            pushMessage(e)
            if (!(e instanceof TypeError) && count <= 5) {
                console.log('[Info]:Retry...');
                return this.safeCallDb(func, count + 1, ...args);
            }
        }
    }

}