import { neon } from '@neondatabase/serverless';

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
    const sql = neon(process.env.DATABASE_URL);

    // 查询关注数量
    const followingResult = await sql`
      SELECT COUNT(*) as count FROM follows WHERE follower_id = ${user_id}
    `;
    
    // 查询粉丝数量
    const followersResult = await sql`
      SELECT COUNT(*) as count FROM follows WHERE following_id = ${user_id}
    `;

    // 查询当前用户是否关注了这个用户
    let isFollowing = false;
    if (current_user_id) {
      const followResult = await sql`
        SELECT id FROM follows 
        WHERE follower_id = ${current_user_id} AND following_id = ${user_id}
      `;
      isFollowing = followResult.length > 0;
    }

    return res.json({
      ok: true,
      following_count: parseInt(followingResult[0].count),
      followers_count: parseInt(followersResult[0].count),
      is_following: isFollowing
    });
  } catch (error) {
    console.error('Follow stats error:', error);
    return res.status(500).json({ ok: false, error: error.message });
  }
}