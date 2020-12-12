import { MyMongoDb, CollectionRepository, MongoDatastore } from './myMongodb';
import { BaseDatastore, Order } from './datastore';
import { Collection } from 'mongodb';

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
            if ('orderName' && 'id' in order) {
                this.activeOrders.set(order['orderName'], order);
            }
        });
        // const order: Partial<Order> = { id: '', status: '', orderName: '' }
        // const order: Pick<Order, "id" | "orderName"> = { id: '', status: '', orderName: '', expiration: 0, symbol: '', type: '', side: 'buy' }
        // const hasOrderPropety = [...Object.keys(order)].reduce((accum, key) => !!(data[key]) && accum, false);
    }
    public async saveToDb() {
        const updatePromise = this.db.bulkUpsert(this.collections.orders, [...this.activeOrders.values()])
            .catch(e => Promise.reject('reject:bulkUpsert'))

        const deletePromise = this.db.bulkDelete(this.collections.orders, [...this.contractedOrders.values()])
            .catch(e => Promise.reject('reject:bulkDelete'));
            
        (await Promise.all([updatePromise, deletePromise])).map((v) => { })
        // this.safeCallDb(this.db.bulkUpsert, 0, this.collections.orders, [...this.activeOrders.values()])
        // try {
        //     const res = await this.db.bulkUpsert(this.collections.orders,orders);
        // } catch (e) {
        //     console.log('e :>> ', e);
        //     if (count <= 3) {
        //         this.safeCallDb(func, count + 1, ...args);
        //     }
        //     else {

        //     }
        // }
    }
    private async callDb(func: (arg0: Collection<{ id: string; }>, arg1: Order[]) => any, count?: number, ...args: [any, any]) {
        try {
            const res = await func(...args);
        } catch (e) {
            console.log('e :>> ', e);
            if (count <= 3) {
                this.safeCallDb(func, count + 1, ...args);
            }
            else {

            }
        }

    }
    private async safeCallDb(func: (arg0: Collection<{ id: string; }>, arg1: Order[]) => any, count?: number, ...args: [any, any]) {
        try {
            const res = await func(...args);
        } catch (e) {
            console.log('e :>> ', e);
            if (count <= 3) {
                this.safeCallDb(func, count + 1, ...args);
            }
            else {

            }
        }

    }

}