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
      `select f.id, f.filename, f.mime, coalesce(f.url, '') as url, f.created_at as "uploadedAt"
         from files f
         join users u on u.id = f.user_id
        where u.username = $1
        order by f.created_at desc`,
      [username]
    );
    res.json({ ok: true, files: rows });
  } catch (error) {
    console.error('files list error', error);
    res.status(500).json({ ok: false, error: '服务器错误' });
  }
};
