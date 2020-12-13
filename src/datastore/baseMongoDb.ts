import { Collection, Db, FilterQuery, MongoClient } from 'mongodb';
import { DbDatastore, MinimalOrder } from './datastoreInterface';
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
  addCollection(name: string): void
  bulkDelete(collection: Collection, Orders: MinimalOrder[]): Promise<void>;
  bulkUpsert(collection: Collection, Orders: MinimalOrder[]): Promise<void>;
  close(): void
  connect(): Promise<void>
  findDocuments(collection: Collection, query?: FilterQuery<any>): Promise<MinimalOrder[]>
}
export type CollectionRepository = {
  orders: Collection<MinimalOrder>
  [other: string]: Collection<any>
}
export class MongoDatastore implements MongoDatastoreInterface {
  protected client: MongoClient;
  protected db: Db;
  protected collections: CollectionRepository = {
    orders: null
  }
  constructor() {
    this.client = new MongoClient(URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  }
  public addCollection(collectionName: string) {
    this.collections[collectionName] = this.db.collection(collectionName);
  }
  public async bulkDelete(collection: Collection, orders: MinimalOrder[]) {
    if (orders.length == 0) return
    try {
      const result = (await collection.bulkWrite(makeOperations('delete', orders))).result
      console.log('result :>> ', result);
    } catch (e) {
      console.log('e :>> ', e);
    }
  }
  public async bulkUpsert(collection: Collection, orders: MinimalOrder[]) {
    if (orders.length == 0) return
    try {
      const result = (await collection.bulkWrite(makeOperations('update', orders))).result
      console.log('result :>> ', result);
    } catch (e) {
      console.log('e :>> ', e);
    }

  }
  public close(): void { this.client.close() }
  public async connect(): Promise<void> {
    try {
      await this.client.connect();
      this.db = this.client.db(CONFIG.DB.DB_NAME);
      this.collections.orders = this.db.collection(CONFIG.DB.COLLECTION_NAME);
    } catch (e) {
      console.log('e :>> ', e);
      this.client.close();
    }
  }
  public async findDocuments(collection: Collection, query: FilterQuery<any> = {}): Promise<MinimalOrder[]> {
    try {
      const result = await collection.find(query).toArray()
      console.log("Found the following records");
      console.log(result);
      return result
    } catch (e) {
      console.log('e :>> ', e);
    }
  }
  public async test() {
    await this.connect();
    // await this.findDocuments(this.collections.orders, {});
    await this.bulkUpsert(this.collections.orders, [{ id: '3111', orderName: "op" }, { id: '222', orderName: "canceled" }])
    await this.findDocuments(this.collections.orders, {});
  }
}

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
