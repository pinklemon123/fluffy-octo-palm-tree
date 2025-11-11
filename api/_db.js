// api/_db.js
import pkg from 'pg';
const { Pool } = pkg;

// 全局连接池，避免冷启动时创建过多连接
let pool;

export function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  }
  return pool;
}

export { pool };