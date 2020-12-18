import { MongoDatastore, MongoDatastoreInterface } from './base-mongo-db';
import { Order } from './datastore-interface';
import { BaseDatastore } from './datastore';

export class DatastoreWithMongo extends BaseDatastore {
    public readonly db: MongoDatastoreInterface;
    protected readonly COLLECTION_NAME: string = 'orders';
    constructor() {
        super();
        this.db = new MongoDatastore();
    }
    public async init(): Promise<void> {
        await this.db.connect();
        const data = (await this.db.findDocuments(this.COLLECTION_NAME, {})) as Order[]
        data.forEach(order => {
            if (('orderName' in order) && ('id' in order)) {
                this.activeOrders.set(order['orderName'], order);
            }
        });
    }
    public saveToDb = async (count = 0) => {
        try {
            const data = [...this.contractedOrders.values(), ...this.getExpiredOrders(), ...this.activeOrders.values()]
            await this.db.bulkUpsert(this.COLLECTION_NAME, data);
        } catch (e) {
            console.log('[ERROR]:FAILED_DB_REQUEST', e);
            await this.db.close();
           await this.pushMessage(e);
            if (!(e instanceof TypeError) && count <= 5) {
                console.log('[Info]:Retry...');
                await this.db.connect();
                await this.saveToDb(count + 1);
            }
        }
    }
    // private safeCallDb = async (func, count: number, ...args: any[]) => {
    //     try {
    //         console.log('count :>> ', count);
    //         console.log('args :>> ', args);
    //         await func(...args);
    //     } catch (e) {
    //         console.log('[ERROR]:FAILED_DB_REQUEST', e);
    //         this.pushMessage(e)
    //         if (!(e instanceof TypeError) && count <= 5) {
    //             console.log('[Info]:Retry...');
    //             await this.safeCallDb(func, count + 1, ...args);
    //         }
    //     }
    // }
}
// export class DatastoreWithMongo1 extends BaseDatastore {
//     db: MongoDatastoreInterface;
//     collections: CollectionRepository = {
//         orders: null
//     }
//     constructor() {
//         super();
//         this.db = new MongoDatastore();
//     }
//     public async init(): Promise<void> {
//         if (this.collections.orders == undefined) {
//             this.collections.orders = this.db.addCollection('orders');
//         }
//         await this.db.connect();
//         const data = (await this.db.findDocuments(this.collections.orders, {})) as Order[]
//         data.forEach(order => {
//             if (('orderName' in order) && ('id' in order)) {
//                 this.activeOrders.set(order['orderName'], order);
//             }
//         });
//     }
//     public async saveToDb() {
//         const data = [...this.contractedOrders.values(), ...this.getExpiredOrders()]
//         await this.safeCallDb(this.db.bulkUpsert, 0, this.collections.orders, [...this.activeOrders.values()]);
//         // await this.safeCallDb(this.db.bulkDelete, 0, this.collections.orders, data);
//     }
//     private async safeCallDb(func: (arg0: Collection<{ id: string; }>, arg1: Order[]) => any, count?: number, ...args: [any, any]) {
//         try {
//             return await func(...args);
//         } catch (e) {
//             console.log('[ERROR]:FAILED_DB_REQUEST', e);
//             this.pushMessage(e)
//             if (!(e instanceof TypeError) && count <= 5) {
//                 console.log('[Info]:Retry...');
//                 await this.safeCallDb(func, count + 1, ...args);
//             }
//         }
//     }

// }