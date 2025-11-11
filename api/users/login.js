const bcrypt = require('bcryptjs');
const { query } = require('../_lib/db');
const { signToken } = require('../_lib/auth');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method Not Allowed' });
    return;
  }
  try {
    const { username = '', password = '' } = req.body || {};
    if (!username.trim() || !password) {
      res.status(400).json({ ok: false, error: '用户名和密码必填' });
      return;
    }
    const { rows } = await query(
      'select id, username, password_hash, coalesce(avatar_url, \'\') as "avatarUrl", coalesce(bio, \'\') as bio from users where username=$1',
      [username.trim()]
    );
    const user = rows[0];
    if (!user) {
      res.status(401).json({ ok: false, error: '用户不存在或密码错误' });
      return;
    }
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      res.status(401).json({ ok: false, error: '用户不存在或密码错误' });
      return;
    }
    const token = signToken(user);
    res.json({ ok: true, token, profile: { username: user.username, avatarUrl: user.avatarUrl, bio: user.bio } });
  } catch (error) {
    console.error('login error', error);
    res.status(500).json({ ok: false, error: '服务器错误' });
  }
};
