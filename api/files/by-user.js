import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const { user_id } = req.query;
    if (!user_id) {
      return res.status(400).json({ ok: false, error: 'Missing user_id' });
    }

    const sql = neon(process.env.DATABASE_URL);
    const result = await sql`
      SELECT id, filename, size, mime, created_at 
      FROM files 
      WHERE user_id = ${user_id} 
      ORDER BY created_at DESC
    `;

    return res.json({
      ok: true,
      data: result
    });
  } catch (error) {
    console.error('Get files by user error:', error);
    return res.status(500).json({ ok: false, error: error.message });
  }
}