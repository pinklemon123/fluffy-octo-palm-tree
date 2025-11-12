import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const { user_id } = req.query; // 支持根据用户ID筛选
    const sql = neon(process.env.DATABASE_URL);
    
    let posts;
    if (user_id) {
      posts = await sql`
        SELECT 
          p.id, p.content, p.created_at,
          u.username,
          f.id as file_id, f.filename, f.mime
        FROM posts p 
        LEFT JOIN users u ON p.user_id = u.id
        LEFT JOIN files f ON p.file_id = f.id
        WHERE p.user_id = ${user_id}
        ORDER BY p.created_at DESC
      `;
    } else {
      posts = await sql`
        SELECT 
          p.id, p.content, p.created_at,
          u.username,
          f.id as file_id, f.filename, f.mime
        FROM posts p 
        LEFT JOIN users u ON p.user_id = u.id
        LEFT JOIN files f ON p.file_id = f.id
        ORDER BY p.created_at DESC
      `;
    }

    const data = posts.map(row => ({
      id: row.id,
      content: row.content,
      created_at: row.created_at,
      username: row.username,
      file: row.file_id ? {
        id: row.file_id,
        filename: row.filename,
        mime: row.mime
      } : null
    }));

    return res.json({ ok: true, data });
  } catch (error) {
    console.error('List posts error:', error);
    return res.status(500).json({ ok: false, error: error.message });
  }
}
