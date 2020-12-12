import { Collection, Db, FilterQuery, MongoClient } from 'mongodb';
import CONFIG from './config';

const URI = `mongodb+srv://new_user0:${CONFIG.DB.DB_PASSWORD}@cluster0.idfhd.mongodb.net/${CONFIG.DB.DB_NAME}?retryWrites=true&w=majority`;

const makeOperations = <T extends { id: string }>(option: 'update' | 'delete', orders: T[]) => {
  const op = []
  // const deleteOpTemp = { deleteOne: { "filter": { "id": null } } };
  // const template = {
  //   updateOne:
  //   {
  //     "filter": { "id": null },
  //     "update": { $set: null },
  //     "upsert": true
  //   }
  // }
  switch (option) {
    case 'update':
      for (const order of orders) {
        // template.updateOne.filter.id = order.id;
        // template.updateOne.update.$set = order;
        op.push({ updateOne: { "filter": { "id": order.id }, "update": { $set: order }, "upsert": true } });
        // op.push({ ...template });
      }
      break;
    case 'delete':
      for (const order of orders) {
        // deleteOpTemp.deleteOne.filter.id = order.id;
        op.push({ deleteOne: { "filter": { "id": order.id } } });
        // op.push({ ...deleteOpTemp });
      }
      break;
    default:
      console.log('[ERROR]:NO_OPTION');
  }
  return op;
}

export interface DbDatastore {
  close(): void
  connect(): Promise<void>
}
export interface MongoDatastore extends DbDatastore {
  addCollection(name: string): void
  bulkDelete<T extends { id: string }>(collection: Collection, Orders: T[]): Promise<void>;
  bulkUpsert<T extends { id: string }>(collection: Collection, Orders: T[]): Promise<void>;
  close(): void
  connect(): Promise<void>
  findDocuments<T extends { id: string }>(collection: Collection, query?: FilterQuery<any>): Promise<T[]>
}
export type CollectionRepository = {
  orders: Collection<{ id: string }>
  [other: string]: Collection<any>
}
export class MyMongoDb implements MongoDatastore {
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
  public addCollection<T>(collectionName: string) {
    this.collections[collectionName] = this.db.collection<T>(collectionName);
  }
  public async bulkDelete<T extends { id: string }>(collection: Collection, orders: T[]) {
    if (orders.length == 0) return
    try {
      const result = (await collection.bulkWrite(makeOperations('delete', orders))).result
      console.log('result :>> ', result);
    } catch (e) {
      console.log('e :>> ', e);
    }
  }
  public async bulkUpsert<T extends { id: string }>(collection: Collection, orders: T[]) {
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
  public async findDocuments<T extends { id: string }>(collection: Collection, query: FilterQuery<any> = {}): Promise<T[]> {
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
    await this.bulkUpsert(this.collections.orders, [{ id: '3111', hoge: "op" }, { id: '222', hoge: "canceled" }])
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

// const order: Order = {
//   orderName: 'testOrder',
//   id: '12121',
//   expiration: 0,
//   status: 'open',
//   symbol: 'ETH/USD',
//   type: 'limit',
//   side: 'buy',
//   timestamp: 0,
//   amount: 0,
//   price: 0,
//   params: {},
// }
// const client = new MongoClient(URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

// const collections: {
//   orders: Collection<Order>
// } = {
//   orders: null
// }

// const insertDocuments = async (collection: Collection, data: any[]) => {
//   try {
//     const result = await collection.insertMany(data);
//     console.log('result :>> ', result);
//   } catch (e) {
//     console.log('e :>> ', e);
//   }
// }

// const findDocuments = async <T extends { id: string }>(collection: Collection): Promise<T[]> => {
//   try {
//     const result = await collection.find({}).toArray()
//     console.log("Found the following records");
//     console.log(result);
//     return result
//   } catch (e) {
//     console.log('e :>> ', e);
//   }
// };

// // const updsertDocuments = async (collection: Collection) => {
// //   try {
// //     const result = await collection.updateOne({ b: 1 }, { $set: { b: 10101 } }, { upsert: true });
// //     console.log('result  :>> ', result);
// //   } catch (e) {
// //     console.log('e :>> ', e);
// //   }
// // }
// const deleteAllDocuments = async (collection: Collection) => {
//   const query = { a: 2 };
//   const result = await collection.deleteMany(query);
//   console.log("Deleted " + result.deletedCount + " documents");
// }

// const bulkUpsert = async <T extends { id: string }>(collection: Collection, orders: T[]) => {
//   try {
//     const result = (await collection.bulkWrite(makeOperations('update', orders))).result
//     console.log('result :>> ', result);
//   } catch (e) {
//     console.log('e :>> ', e);
//   }
// }
// const bulkDelete = async <T extends { id: string }>(collection: Collection, orders: T[]) => {
//   try {
//     const result = (await collection.bulkWrite(makeOperations('delete', orders))).result
//     console.log('result :>> ', result);
//   } catch (e) {
//     console.log('e :>> ', e);
//   }
// }