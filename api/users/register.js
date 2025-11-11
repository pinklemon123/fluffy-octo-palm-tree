const bcrypt = require('bcryptjs');
const { query } = require('../_lib/db');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method Not Allowed' });
    return;
  }
  try {
    const { username = '', password = '' } = req.body || {};
    if (!username.trim() || password.length < 6) {
      res.status(400).json({ ok: false, error: '用户名必填，密码至少 6 位' });
      return;
    }
    const hash = await bcrypt.hash(password, 10);
    await query(
      'insert into users (username, password_hash) values ($1, $2)',
      [username.trim(), hash]
    );
    res.json({ ok: true });
  } catch (error) {
    if (error.code === '23505') {
      res.status(409).json({ ok: false, error: '用户名已存在' });
      return;
    }
    console.error('register error', error);
    res.status(500).json({ ok: false, error: '服务器错误' });
  }
};
