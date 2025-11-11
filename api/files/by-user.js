// /api/files/by-user.js - 根据用户ID获取文件列表
import { getDbConnection } from '../_db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const { user_id } = req.query;
    if (!user_id) {
      return res.status(400).json({ ok: false, error: 'Missing user_id' });
    }

    const db = getDbConnection();
    const result = await db.query(
      'SELECT id, filename, size, mime, created_at FROM files WHERE user_id = $1 ORDER BY created_at DESC',
      [user_id]
    );

    return res.json({
      ok: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get files by user error:', error);
    return res.status(500).json({ ok: false, error: error.message });
  }
}