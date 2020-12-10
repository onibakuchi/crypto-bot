import { Db, MongoClient } from 'mongodb';
const dbname = 'test';
const uri = `mongodb+srv://new_user0:${process.env.MONGO_DB_PASSWORD}@cluster0.idfhd.mongodb.net/${dbname}?retryWrites=true&w=majority`;
const collectionName = 'test_naem';

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const insertDocuments = async (db: Db, data: any[]) => {
  const collection = db.collection(collectionName);
  try {
    const result = await collection.insertMany(data);
    console.log('result :>> ', result);
  } catch (e) {
    console.log('e :>> ', e);
  }
}

const findDocuments = async (db: Db) => {
  // Get the documents collection
  const collection = db.collection(collectionName);
  // Find some documents
  try {
    const result = await collection.find({}).toArray()
    console.log("Found the following records");
    console.log(result)
  } catch (e) {
    console.log('e :>> ', e);
  }
};

(async () => {
  await client.connect();
  const db = client.db(collectionName);

  await insertDocuments(db, [{ b: 1 }, { b: 21 }])
  await findDocuments(db)

})

setTimeout(() => {
  ;
}, 1000);