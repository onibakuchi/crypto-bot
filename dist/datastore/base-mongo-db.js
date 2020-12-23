"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoDatastore = void 0;
const mongodb_1 = require("mongodb");
const config_1 = __importDefault(require("../config/config"));
const URI = `mongodb+srv://new_user0:${config_1.default.DB.DB_PASSWORD}@cluster0.idfhd.mongodb.net/${config_1.default.DB.DB_NAME}?retryWrites=true&w=majority`;
const makeOperations = (option, orders) => {
    const op = [];
    switch (option) {
        case 'update':
            for (const order of orders) {
                op.push({ updateOne: { "filter": { "orderName": order.orderName }, "update": { $set: order }, "upsert": true } });
            }
            break;
        case 'delete':
            for (const order of orders) {
                op.push({ deleteOne: { "filter": { "orderName": order.orderName } } });
            }
            break;
        default:
            console.log('[ERROR]:NO_OPMinimalOrderION');
    }
    return op;
};
class MongoDatastore {
    constructor() {
        this.collections = {
            orders: null
        };
        this.client = new mongodb_1.MongoClient(URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
    }
    addConnection(collectionName) {
        this.collections[collectionName] = this.mongodb.collection(collectionName);
        // return this.mongodb.collection(collectionName);
    }
    async bulkDelete(name, orders) {
        if (orders.length == 0)
            return;
        try {
            const result = (await this.collections[name].bulkWrite(makeOperations('delete', orders))).result;
            console.log('result :>> ', result);
        }
        catch (e) {
            console.log('e :>> ', e);
            await this.close();
            await this.client.connect();
        }
    }
    async bulkUpsert(name, orders) {
        if (orders.length == 0)
            return;
        try {
            const result = (await this.collections[name].bulkWrite(makeOperations('update', orders))).result;
            console.log('result :>> ', result);
        }
        catch (e) {
            console.log('e :>> ', e);
            await this.close();
            await this.client.connect();
        }
    }
    async close() { await this.client.close(); }
    async connect() {
        try {
            await this.client.connect();
            this.mongodb = this.client.db(config_1.default.DB.DB_NAME);
            this.collections.orders = this.mongodb.collection(config_1.default.DB.COLLECTION_NAME);
            await this.collections.orders.createIndex({ orderName: 1 }, { unique: true });
            console.log(`[Info]:DB_CONNECT \nDB_NAME:${config_1.default.DB.DB_NAME}\nCOLLECTION_NAME:${config_1.default.DB.COLLECTION_NAME}`);
        }
        catch (e) {
            console.log('e :>> ', e);
            await this.client.close();
        }
    }
    async findDocuments(name, query = {}) {
        try {
            const result = await this.collections[name].find(query).toArray();
            console.log("Found the following records");
            console.log(result);
            return result;
        }
        catch (e) {
            console.log('e :>> ', e);
            await this.close();
            await this.client.connect();
        }
    }
    async test() {
        await this.connect();
        // await this.findDocuments(this.collections.orders, {});
        await this.bulkUpsert('orders', [{ id: '3111', orderName: "op" }, { id: '222', orderName: "canceled" }]);
        await this.findDocuments('orders', {});
    }
}
exports.MongoDatastore = MongoDatastore;
// export class MongoDatastore1 implements MongoDatastoreInterface {
//   protected client: MongoClient;
//   protected mongodb: Db;
//   // protected collections: CollectionRepository = {
//   //   orders: null
//   // }
//   constructor() {
//     this.client = new MongoClient(URI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true
//     });
//   }
//   public addCollection(collectionName: string) {
//     return this.mongodb.collection(collectionName);
//   }
//   public async bulkDelete(collection: Collection, orders: MinimalOrder[]) {
//     if (orders.length == 0) return
//     try {
//       const result = (await collection.bulkWrite(makeOperations('delete', orders))).result
//       console.log('result :>> ', result);
//     } catch (e) {
//       console.log('e :>> ', e);
//     }
//   }
//   public async bulkUpsert(collection: Collection, orders: MinimalOrder[]) {
//     if (orders.length == 0) return
//     try {
//       const result = (await collection.bulkWrite(makeOperations('update', orders))).result
//       console.log('result :>> ', result);
//     } catch (e) {
//       console.log('e :>> ', e);
//     }
//   }
//   public close(): void { this.client.close() }
//   public async connect(): Promise<void> {
//     try {
//       await this.client.connect();
//       this.mongodb = this.client.db(CONFIG.DB.DB_NAME);
//       // this.collections.orders = this.mongodb.collection(CONFIG.DB.COLLECTION_NAME);
//     } catch (e) {
//       console.log('e :>> ', e);
//       this.client.close();
//     }
//   }
//   public async findDocuments(collection: Collection, query: FilterQuery<any> = {}): Promise<MinimalOrder[]> {
//     try {
//       const result = await collection.find(query).toArray()
//       console.log("Found the following records");
//       console.log(result);
//       return result
//     } catch (e) {
//       console.log('e :>> ', e);
//     }
//   }
//   public async test(collection: Collection<any>) {
//     await this.connect();
//     await this.findDocuments(collection, {});
//     await this.bulkUpsert(collection, [{ id: '3111', orderName: "op" }, { id: '222', orderName: "canceled" }])
//     await this.findDocuments(collection, {});
//   }
// }
// (async () => {
//   let instance: MongoDb;
//   try {
//     instance = new MongoDb();
//     // await instance.connect();
//     await instance.test();
//   } finally {
//     instance.close()
//   }
// })()
