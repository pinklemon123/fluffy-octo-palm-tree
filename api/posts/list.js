const { query } = require('../_lib/db');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({ ok: false, error: 'Method Not Allowed' });
    return;
  }
  try {
    const limit = Math.min(parseInt(req.query.limit || '50', 10) || 50, 100);
    const { rows } = await query(
      `select 
         p.id,
         p.content,
         p.created_at as "createdAt",
         json_build_object(
           'username', u.username,
           'avatarUrl', coalesce(u.avatar_url, '')
         ) as user,
         case when f.id is null then null else json_build_object(
           'id', f.id,
           'filename', f.filename,
           'mime', f.mime,
           'url', coalesce(f.url, '')
         ) end as file
       from posts p
       join users u on u.id = p.user_id
       left join files f on f.id = p.file_id
       order by p.created_at desc
       limit $1`,
      [limit]
    );
    res.json({ ok: true, data: rows });
  } catch (error) {
    console.error('list posts error', error);
    res.status(500).json({ ok: false, error: '服务器错误' });
  }
};
