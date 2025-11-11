import pg from 'pg';
const { Pool } = pg;
export const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
export async function q(text, params){ const c = await pool.connect(); try{ return await c.query(text, params);} finally{ c.release(); } }
