import { Collection, Db, MongoClient } from 'mongodb';
import { Order } from './Datastore';
import CONFIG from './config';
const dbname = 'test';
const URI = `mongodb+srv://new_user0:${CONFIG.DB.DB_PASSWORD}@cluster0.idfhd.mongodb.net/${CONFIG.DB.DB_NAME}?retryWrites=true&w=majority`;
const collectionName = 'test_naem';
const order: Order = {
  orderName: 'testOrder',
  id: '12121',
  expiration: 0,
  status: 'open',
  symbol: 'ETH/USD',
  type: 'limit',
  side: 'buy',
  timestamp: 0,
  amount: 0,
  price: 0,
  params: {},
}
const client = new MongoClient(URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const collections: {
  orders: Collection<Order>
} = {
  orders: null
}

const insertDocuments = async (collection: Collection, data: any[]) => {
  try {
    const result = await collection.insertMany(data);
    console.log('result :>> ', result);
  } catch (e) {
    console.log('e :>> ', e);
  }
}

const findDocuments = async <T extends { id: string }>(collection: Collection): Promise<T[]> => {
  try {
    const result = await collection.find({}).toArray()
    console.log("Found the following records");
    console.log(result);
    return result
  } catch (e) {
    console.log('e :>> ', e);
  }
};

// const updsertDocuments = async (collection: Collection) => {
//   try {
//     const result = await collection.updateOne({ b: 1 }, { $set: { b: 10101 } }, { upsert: true });
//     console.log('result  :>> ', result);
//   } catch (e) {
//     console.log('e :>> ', e);
//   }
// }
const deleteAllDocuments = async (collection: Collection) => {
  const query = { a: 2 };
  const result = await collection.deleteMany(query);
  console.log("Deleted " + result.deletedCount + " documents");
}
const makeOperations = <T extends { id: string }>(option: 'update' | 'delete', orders: T[]) => {
  const op = []
  const deleteOpTemp = { deleteOne: { "filter": { "id": null } } };
  const template = {
    updateOne:
    {
      "filter": { "id": null },
      "update": { $set: null },
      "upsert": true
    }
  }
  switch (option) {
    case 'update':
      for (const order of orders) {
        template.updateOne.filter.id = order.id;
        template.updateOne.update.$set = order;
        op.push({ ...template })
      }
      break;
    case 'delete':
      for (const order of orders) {
        deleteOpTemp.deleteOne.filter.id = order.id;
        op.push({ ...deleteOpTemp })
        console.log('op :>> ', op);
      }
      break;
    default:
      console.log('[ERROR]:NO_OPTION');
  }
  return op;
}

const bulkUpsert = async <T extends { id: string }>(collection: Collection, orders: T[]) => {
  try {
    const result = (await collection.bulkWrite(makeOperations('update', orders))).result
    console.log('result :>> ', result);
  } catch (e) {
    console.log('e :>> ', e);
  }
}
const bulkDelete = async <T extends { id: string }>(collection: Collection, orders: T[]) => {
  try {
    const result = (await collection.bulkWrite(makeOperations('delete', orders))).result
    console.log('result :>> ', result);
  } catch (e) {
    console.log('e :>> ', e);
  }
}
interface DbInterface {
  bulkDelete: <T extends { id: string }>(collection: Collection, Orders: T[]) => void;
  bulkUpsert: <T extends { id: string }>(collection: Collection, Orders: T[]) => void;
}
class MongoDb implements DbInterface {
  protected client: MongoClient;
  protected db: Db;
  protected collections: {
    orders: Collection<Order>
    [other: string]: Collection<any>
  } = {
      orders: null
    }
  constructor() {
    this.client = new MongoClient(URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
  }
  public async init(): Promise<{ id: string; }[]> {
    await client.connect();
    this.db = client.db(CONFIG.DB.COLLECTION_NAME);
    this.collections.orders = this.db.collection(CONFIG.DB.COLLECTION_NAME);
    return await this.findDocuments(this.collections.orders);
  }
  public bulkDelete: <T extends { id: string }>(collection: Collection, Orders: T[]) => void;
  public bulkUpsert: <T extends { id: string }>(collection: Collection, Orders: T[]) => void;
  public findDocuments = async <T extends { id: string }>(collection: Collection): Promise<T[]> => {
    try {
      const result = await collection.find({}).toArray()
      console.log("Found the following records");
      console.log(result);
      return result
    } catch (e) {
      console.log('e :>> ', e);
    }
  };
}

(async () => {
  try {
    await client.connect();
    const db = client.db(collectionName);
    collections.orders = db.collection(collectionName);

    // const result = await collections.orders.createIndex({ fullplot: "text" }, { default_language: "english" });
    // console.log(`Index created: ${result}`);

    // await deleteAllDocuments(collections.orders)
    // await insertDocuments(collections.orders, [order])
    // await updsertDocuments(collections.orders)
    // await bulkUpsert(collections.orders, [order]);
    await bulkDelete(collections.orders, [order])
    await findDocuments(collections.orders)
  } finally {
    client.close()
  }
})()