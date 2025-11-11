const { query } = require('../_lib/db');
const { requireUser } = require('../_lib/auth');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method Not Allowed' });
    return;
  }
  try {
    const user = requireUser(req);
    const { avatarUrl = '', bio = '' } = req.body || {};
    await query(
      'update users set avatar_url=$1, bio=$2 where id=$3',
      [avatarUrl, bio, user.id]
    );
    res.json({ ok: true });
  } catch (error) {
    const status = error.statusCode || 500;
    console.error('profile update error', error);
    res.status(status).json({ ok: false, error: status === 401 ? error.message : '服务器错误' });
  }
};
