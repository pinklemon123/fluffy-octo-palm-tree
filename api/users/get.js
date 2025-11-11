// /api/users/get.js - 通过ID获取用户信息
import { getDbConnection } from '../_db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ ok: false, error: 'Missing user id' });
    }

    const db = getDbConnection();
    const result = await db.query('SELECT id, username, bio, avatar_url, created_at FROM users WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, error: 'User not found' });
    }

    return res.json({ 
      ok: true, 
      user: result.rows[0] 
    });
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({ ok: false, error: error.message });
  }
}