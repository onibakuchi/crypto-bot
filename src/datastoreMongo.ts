import { MyMongoDb, CollectionRepository, DbInterface } from './myMongodb';
import { BaseDatastore, DatastoreInterface } from './datastore';

class DatastoreWithMongo extends BaseDatastore {
    db: DbInterface;
    collections: CollectionRepository;
    constructor() {
        super();
        this.db = new MyMongoDb();
    }
    public async init() {
        this.collections = await this.db.connect();
        this.db.findDocuments(this.collections.orders, {})
    }
    public hook() {
        this.db.bulkUpsert(this.collections.orders, [...this.activeOrders.values()]);
        this.db.bulkDelete(this.collections.orders, [...this.contractedOrders.values()]);
        Promise.all
    }
    public setDb() {
        this.db;
    }

}