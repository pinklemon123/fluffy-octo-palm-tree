const { query } = require('../_lib/db');
const { requireUser } = require('../_lib/auth');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method Not Allowed' });
    return;
  }
  try {
    const me = requireUser(req);
    const { target = '' } = req.body || {};
    if (!target.trim() || target.trim() === me.username) {
      res.status(400).json({ ok: false, error: '目标无效' });
      return;
    }
    const { rows } = await query('select id from users where username=$1', [target.trim()]);
    const targetUser = rows[0];
    if (!targetUser) {
      res.status(404).json({ ok: false, error: '用户不存在' });
      return;
    }
    await query(
      'insert into follows (follower_id, following_id) values ($1, $2) on conflict do nothing',
      [me.id, targetUser.id]
    );
    res.json({ ok: true });
  } catch (error) {
    const status = error.statusCode || 500;
    console.error('follow add error', error);
    res.status(status).json({ ok: false, error: status === 401 ? error.message : '服务器错误' });
  }
};
