import { Collection, Db, MongoClient } from 'mongodb';
import { Order } from './Datastore';

const dbname = 'test';
const uri = `mongodb+srv://new_user0:${process.env.MONGO_DB_PASSWORD}@cluster0.idfhd.mongodb.net/${dbname}?retryWrites=true&w=majority`;
const collectionName = 'test_naem';
const orders: Order = {
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
const client = new MongoClient(uri, {
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

const findDocuments = async (collection: Collection) => {
  try {
    const result = await collection.find({}).toArray()
    console.log("Found the following records");
    console.log(result)
  } catch (e) {
    console.log('e :>> ', e);
  }
};

const updsertDocuments = async (collection: Collection) => {
  try {
    const result = await collection.updateOne({ b: 1 }, { $set: { b: 10101 } }, { upsert: true });
    console.log('result  :>> ', result);
  } catch (e) {
    console.log('e :>> ', e);
  }
}
const deleteAllDocuments = async (collection: Collection) => {
  const query = { a: 2 };
  const result = await collection.deleteMany(query);
  console.log("Deleted " + result.deletedCount + " documents");
}
const MakeOperation = (option, orders: Order[]) => {
  const op = []
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
      const deleteOpTemp = { deleteOne: { "filter": { "id": null } } };
      for (const order of orders) {
        template.updateOne.filter.id = order.id;
        op.push({ ...template })
      }
      break;
  }
  return op;
}

const bulkUpdate = async (collection: Collection, orders: Order[]) => {
  const operations = [];
  for (const order of orders) {
    const template = {
      updateOne:
      {
        "filter": { "order": order.id },
        "update": { $set: order },
        "upsert": true
      }
    }
    operations.push(template)
  }
  const result = await collection.bulkWrite([
    {
      updateOne:
      {
        "filter": { "order": "" },
        "update": { $set: { "status": "open" } },
        "upsert": true
      }
    },
  ])
  console.log('result :>> ', result);
}

(async () => {
  try {
    await client.connect();
    const db = client.db(collectionName);
    collections.orders = db.collection(collectionName);

    // const result = await collections.orders.createIndex({ fullplot: "text" }, { default_language: "english" });
    // console.log(`Index created: ${result}`);

    await deleteAllDocuments(collections.orders)
    // await insertDocuments(collections.orders, [{ b: 1 }, { b: 21 }])
    // await updsertDocuments(collections.orders)
    await findDocuments(collections.orders)
  } finally {
    client.close()
  }
})()