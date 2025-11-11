// api/debug/db.js
import { getPool } from '../_db.js';

export default async function handler(req, res) {
  try {
    // 检查环境变量
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      return res.status(500).json({
        ok: false,
        error: 'DATABASE_URL environment variable not found',
        available_env: Object.keys(process.env).filter(key => 
          key.includes('DATABASE') || key.includes('POSTGRES')
        )
      });
    }

    // 测试数据库连接
    const pool = getPool();
    const result = await pool.query(`
      SELECT 
        now() as current_time, 
        current_user as user_name, 
        version() as db_version
    `);
    
    res.status(200).json({
      ok: true,
      connection: 'success',
      row: result.rows[0],
      database_info: {
        url_length: databaseUrl.length,
        host: databaseUrl.match(/@([^:\/]+)/)?.[1] || 'unknown',
        has_ssl: databaseUrl.includes('ssl'),
      }
    });

  } catch (error) {
    res.status(500).json({
      ok: false,
      error: {
        name: error.name,
        message: error.message,
        code: error.code,
        detail: error.detail,
        hint: error.hint,
      }
    });
  }
}