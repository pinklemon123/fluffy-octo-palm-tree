const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

let pool = global._forumPool;
if (!pool) {
  pool = new Pool({
    connectionString,
    max: Number(process.env.PG_POOL_MAX || 10),
    idleTimeoutMillis: Number(process.env.PG_IDLE_TIMEOUT || 30000),
    connectionTimeoutMillis: Number(process.env.PG_CONNECTION_TIMEOUT || 5000),
    ssl: process.env.PG_SSL === 'false' ? false : { rejectUnauthorized: false }
  });
  pool.on('error', (err) => {
    console.error('Unexpected error on idle PostgreSQL client', err);
  });
  global._forumPool = pool;
}

async function query(text, params) {
  const start = Date.now();
  const result = await pool.query(text, params);
  if (process.env.NODE_ENV !== 'production') {
    const duration = Date.now() - start;
    console.log('query', { text, duration, rows: result.rowCount });
  }
  return result;
}

module.exports = {
  query,
  pool
};
