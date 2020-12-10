const MongoClient = require('mongodb').MongoClient;
const dbname = 'test';
const uri = `mongodb+srv://new_user0:${process.env.MONGO_DB_PASSWORD}@cluster0.idfhd.mongodb.net/${dbname}?retryWrites=true&w=majority`;
console.log(process.env.MONGO_DB_PASSWORD);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const collectionName = 'test_naem'
const insertDocuments = function (db, callback) {
  // Get the documents collection
  const collection = db.collection(collectionName);
  // Insert some documents
  collection.insertMany([
    { a: 1 }, { a: 2 }, { a: 3 }
  ], function (err, result) {
    console.log("Inserted 3 documents into the collection");
    callback(result);
  });
}
const findDocuments = function (db, callback) {
  // Get the documents collection
  const collection = db.collection(collectionName);
  // Find some documents
  collection.find({}).toArray(function (err, docs) {
    console.log("Found the following records");
    console.log(docs)
    callback(docs);
  });
}

client.connect(err => {
  const db = client.db(collectionName);
  if (err) return console.log('err :>> ', err);
  insertDocuments(db, () => console.log())
  findDocuments(db, () => client.close())
  // insertDocuments(db, function () {
  //   findDocuments(db, function () {
  //     client.close();
  //   });
});
// perform actions on the collection object
// collection.find({}).toArray((err, docs) => {
//   if (err) return console.log(err);
//   console.log("Found the following records");
//   console.log(docs)
//   // callback(docs);
// });
// client.close();
// });

// Replace < password > with the password for the new_user0 user.Replace < dbname > with the name of the database that connections will use by default.Ensure any option params are URL encoded.