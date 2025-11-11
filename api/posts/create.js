const { query } = require('../_lib/db');
const { requireUser } = require('../_lib/auth');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method Not Allowed' });
    return;
  }
  try {
    const user = requireUser(req);
    const { content = '', fileId = null } = req.body || {};
    if (!content.trim() && !fileId) {
      res.status(400).json({ ok: false, error: '内容或附件必填' });
      return;
    }
    await query(
      'insert into posts (user_id, content, file_id) values ($1, $2, $3)',
      [user.id, content.trim(), fileId]
    );
    res.json({ ok: true });
  } catch (error) {
    const status = error.statusCode || 500;
    console.error('create post error', error);
    res.status(status).json({ ok: false, error: status === 401 ? error.message : '服务器错误' });
  }
};
