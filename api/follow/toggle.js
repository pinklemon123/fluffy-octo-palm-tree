// /api/follow/toggle.js - 切换关注状态
import { getDbConnection } from '../_db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const user_id = req.headers['x-user-id'];
    if (!user_id) {
      return res.status(401).json({ ok: false, error: 'Unauthorized' });
    }

    const { target_id } = req.body;
    if (!target_id) {
      return res.status(400).json({ ok: false, error: 'Missing target_id' });
    }

    if (user_id === target_id) {
      return res.status(400).json({ ok: false, error: 'Cannot follow yourself' });
    }

    const db = getDbConnection();
    
    // 检查是否已经关注
    const existingFollow = await db.query(
      'SELECT id FROM follows WHERE follower_id = $1 AND following_id = $2',
      [user_id, target_id]
    );

    let following = false;
    if (existingFollow.rows.length > 0) {
      // 取消关注
      await db.query('DELETE FROM follows WHERE follower_id = $1 AND following_id = $2', [user_id, target_id]);
      following = false;
    } else {
      // 添加关注
      await db.query(
        'INSERT INTO follows (follower_id, following_id, created_at) VALUES ($1, $2, NOW())',
        [user_id, target_id]
      );
      following = true;
    }

    return res.json({ 
      ok: true, 
      following 
    });
  } catch (error) {
    console.error('Follow toggle error:', error);
    return res.status(500).json({ ok: false, error: error.message });
  }
}