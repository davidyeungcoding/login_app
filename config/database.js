module.exports = {
  database: 'mongodb://localhost:27017/temp',
  secret: '1234'
}

// async function listDatabases(client) {
//   databaseList = await client.db().admin().listDatabases();
//   console.log("Databases:");
//   databaseList.databases.forEach(db => console.log(` - ${db.name}`));
// }

// async function main() {
//   const {MongoClient} = require('mongodb');
//   const uri = "mongodb+srv://dave:rSSD0nyVGVDw43Cj@daves-personal-works.6vhei.gcp.mongodb.net/test?retryWrites=true&w=majority"
//   const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

//   try {
//     await client.connect();
//     await listDatabases(client);
//   } catch (err) {
//     console.error(err);
//   } finally {
//     await client.close();
//   }
// }

// main().catch(console.error);