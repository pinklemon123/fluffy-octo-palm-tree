import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ ok: false, error: 'Missing user id' });
    }

    const sql = neon(process.env.DATABASE_URL);
    const result = await sql`
      SELECT id, username, bio, avatar_url, created_at 
      FROM users 
      WHERE id = ${id}
    `;
    
    if (result.length === 0) {
      return res.status(404).json({ ok: false, error: 'User not found' });
    }

    return res.json({ 
      ok: true, 
      user: result[0] 
    });
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({ ok: false, error: error.message });
  }
}