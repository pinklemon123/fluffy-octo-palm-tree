// /api/follow/stats.js - 获取用户关注统计和关系状态
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

    const current_user_id = req.headers['x-user-id']; // 当前登录用户
    const db = getDbConnection();

    // 查询关注数量
    const followingResult = await db.query(
      'SELECT COUNT(*) as count FROM follows WHERE follower_id = $1',
      [user_id]
    );
    
    // 查询粉丝数量
    const followersResult = await db.query(
      'SELECT COUNT(*) as count FROM follows WHERE following_id = $1',
      [user_id]
    );

    // 查询当前用户是否关注了这个用户
    let isFollowing = false;
    if (current_user_id) {
      const followResult = await db.query(
        'SELECT id FROM follows WHERE follower_id = $1 AND following_id = $2',
        [current_user_id, user_id]
      );
      isFollowing = followResult.rows.length > 0;
    }

    return res.json({
      ok: true,
      following_count: parseInt(followingResult.rows[0].count),
      followers_count: parseInt(followersResult.rows[0].count),
      is_following: isFollowing
    });
  } catch (error) {
    console.error('Follow stats error:', error);
    return res.status(500).json({ ok: false, error: error.message });
  }
}