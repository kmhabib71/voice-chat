#!/usr/bin/env node
/* ---------------------------------------------
   Pick a collection by number → delete every doc
   npm i mongodb dotenv   (once)
   node clearColl.js
--------------------------------------------- */
require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME;
if (!uri || !dbName) {
  console.error('❗  Add MONGODB_URI and MONGODB_DB_NAME to .env');
  process.exit(1);
}

(async () => {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const cols = await db.listCollections({}, { nameOnly: true }).toArray();
    const names = cols.map(c => c.name);

    if (!names.length) {
      console.log('No collections found in database “%s”', dbName);
      return;
    }

    console.log('\n Collections in database “%s”:\n', dbName);
    names.forEach((n, i) => console.log(` ${i + 1}. ${n}`));

    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    readline.question('\n Enter number to wipe > ', async answer => {
      const idx = Number(answer) - 1;
      if (!Number.isInteger(idx) || idx < 0 || idx >= names.length) {
        console.log('❌  Invalid choice');
        readline.close();
        await client.close();
        return;
      }

      const collName = names[idx];
      const { deletedCount } = await db.collection(collName).deleteMany({});
      console.log(`✅  Deleted ${deletedCount} document(s) from “${collName}”`);
      readline.close();
      await client.close();
    });
  } catch (err) {
    console.error('Error:', err.message);
    await client.close();
  }
})();
