import { q } from '../_utils/db-node.js';

export default async function handler(req, res){
  if (req.method !== 'GET') return res.status(405).json({ ok:false, error:'Method Not Allowed' });
  try{
    const r = await q(`
      SELECT id, description, file_id, external_url, file_type, created_at
      FROM design_posts
      ORDER BY created_at DESC
      LIMIT 200
    `);
    const rows = r.rows.map(x => ({
      ...x,
      file_url: x.file_id ? `/api/files/${x.file_id}` : null,
    }));
    res.json({ ok:true, data: rows });
  }catch(e){
    console.error('design/list error:', e);
    res.status(500).json({ ok:false, error: e?.message || String(e) });
  }
}
