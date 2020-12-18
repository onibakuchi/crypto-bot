import { Collection, Db, FilterQuery, MongoClient } from 'mongodb';
import { DbDatastore, MinimalOrder } from './datastore-interface';
import CONFIG from '../config';

const URI = `mongodb+srv://new_user0:${CONFIG.DB.DB_PASSWORD}@cluster0.idfhd.mongodb.net/${CONFIG.DB.DB_NAME}?retryWrites=true&w=majority`;

const makeOperations = (option: 'update' | 'delete', orders: MinimalOrder[]) => {
  const op = []
  switch (option) {
    case 'update':
      for (const order of orders) {
        op.push({ updateOne: { "filter": { "id": order.id }, "update": { $set: order }, "upsert": true } });
      }
      break;
    case 'delete':
      for (const order of orders) {
        op.push({ deleteOne: { "filter": { "id": order.id } } });
      }
      break;
    default:
      console.log('[ERROR]:NO_OPMinimalOrderION');
  }
  return op;
}

export interface MongoDatastoreInterface extends DbDatastore {
  addConnection(name: string): void
  bulkDelete(name: string, Orders: MinimalOrder[]): Promise<void>;
  bulkUpsert(name: string, Orders: MinimalOrder[]): Promise<void>;
  close():Promise<void>
  connect(): Promise<void>
  findDocuments(name: string, query?: FilterQuery<any>): Promise<MinimalOrder[]>
}
export type CollectionRepository = {
  orders: Collection<MinimalOrder>
  [other: string]: Collection<any>
}
export class MongoDatastore implements MongoDatastoreInterface {
  protected client: MongoClient;
  protected mongodb: Db;
  protected collections: CollectionRepository = {
    orders: null
  }
  constructor() {
    this.client = new MongoClient(URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  }
  public addConnection(collectionName: string) {
    this.collections[collectionName] = this.mongodb.collection(collectionName);
    // return this.mongodb.collection(collectionName);
  }
  public async bulkDelete(name: string, orders: MinimalOrder[]) {
    if (orders.length == 0) return
    try {
      const result = (await this.collections[name].bulkWrite(makeOperations('delete', orders))).result
      console.log('result :>> ', result);
    } catch (e) {
      console.log('e :>> ', e);
      await this.close()
    }
  }
  public async bulkUpsert(name: string, orders: MinimalOrder[]) {
    if (orders.length == 0) return
    try {
      const result = (await this.collections[name].bulkWrite(makeOperations('update', orders))).result
      console.log('result :>> ', result);
      await  this.close()
    } catch (e) {
      console.log('e :>> ', e);
      await  this.close()
    }
  }
  public async close(): Promise<void> { await this.client.close() }
  public async connect(): Promise<void> {
    try {
      await this.client.connect();
      this.mongodb = this.client.db(CONFIG.DB.DB_NAME);
      this.collections.orders = this.mongodb.collection(CONFIG.DB.COLLECTION_NAME);
      console.log(`[Info]:DB_CONNECT \nDB_NAME:${CONFIG.DB.DB_NAME}\nCOLLECTION_NAME:${CONFIG.DB.COLLECTION_NAME}`);
    } catch (e) {
      console.log('e :>> ', e);
      await this.client.close();
    }
  }
  public async findDocuments(name: string, query: FilterQuery<any> = {}): Promise<MinimalOrder[]> {
    try {
      const result = await this.collections[name].find(query).toArray()
      console.log("Found the following records");
      console.log(result);
      return result
    } catch (e) {
      console.log('e :>> ', e);
     await this.close()
    }
  }
  public async test() {
    await this.connect();
    // await this.findDocuments(this.collections.orders, {});
    await this.bulkUpsert('orders', [{ id: '3111', orderName: "op" }, { id: '222', orderName: "canceled" }])
    await this.findDocuments('orders', {});
  }
}
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
