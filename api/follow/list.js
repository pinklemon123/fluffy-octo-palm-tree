const { query } = require('../_lib/db');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({ ok: false, error: 'Method Not Allowed' });
    return;
  }
  try {
    const username = (req.query.user || '').trim();
    if (!username) {
      res.status(400).json({ ok: false, error: 'Missing user' });
      return;
    }
    const { rows } = await query(
      `select u2.username as "following"
         from follows f
         join users u1 on u1.id = f.follower_id
         join users u2 on u2.id = f.following_id
        where u1.username = $1
        order by f.created_at desc`,
      [username]
    );
    res.json({ ok: true, follows: rows });
  } catch (error) {
    console.error('follow list error', error);
    res.status(500).json({ ok: false, error: '服务器错误' });
  }
};
