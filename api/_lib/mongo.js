const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'forumdb';

if (!uri) throw new Error('Missing MONGODB_URI');
let cached = global._mongoCached;
if (!cached) cached = global._mongoCached = { client: null, db: null };

async function getDB() {
  if (cached.db) return cached.db;
  const client = new MongoClient(uri, { maxPoolSize: 5 });
  await client.connect();
  const db = client.db(dbName);
  cached.client = client;
  cached.db = db;
  return db;
}

module.exports = { getDB };
