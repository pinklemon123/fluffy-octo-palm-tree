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
      'select username, coalesce(avatar_url, \'\') as "avatarUrl", coalesce(bio, \'\') as bio from users where username=$1',
      [username]
    );
    const profile = rows[0];
    if (!profile) {
      res.json({ ok: false, error: '用户不存在' });
      return;
    }
    res.json({ ok: true, profile });
  } catch (error) {
    console.error('profile view error', error);
    res.status(500).json({ ok: false, error: '服务器错误' });
  }
};
