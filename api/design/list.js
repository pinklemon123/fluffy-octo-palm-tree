import { q } from '../_utils/db-node.js';

export default async function handler(req, res){
  if (req.method !== 'GET') {
    return res.status(405).json({ ok:false, error:'Method Not Allowed' });
  }

  try {
    const r = await q(`
      SELECT 
        dp.id,
        dp.description,
        dp.file_id,
        dp.external_url,
        dp.content_url,
        dp.created_at,
        COALESCE(a.mime_type, dp.file_type, f.mime) AS file_type,
        a.url AS asset_url
      FROM design_posts dp
      LEFT JOIN LATERAL (
        SELECT 
          da.url, 
          da.mime_type
        FROM design_assets da
        WHERE da.entry_id::text = dp.id::text
        ORDER BY da.created_at DESC
        LIMIT 1
      ) a ON true
      LEFT JOIN files f
        ON f.id::text = dp.file_id::text
      ORDER BY dp.created_at DESC
      LIMIT 200
    `);

    const rows = r.rows.map(x => ({
      id: x.id,
      description: x.description,
      external_url: x.external_url,
      created_at: x.created_at,
      file_type: x.file_type || null,
      file_url: x.asset_url
        ? x.asset_url
        : (x.content_url
            ? x.content_url
            : (x.file_id ? `/api/files/${x.file_id}` : null)),
    }));

    res.json({ ok:true, data: rows });
  } catch (e) {
    console.error('design/list error:', e);
    res.status(500).json({ ok:false, error: e?.message || String(e) });
  }
}
