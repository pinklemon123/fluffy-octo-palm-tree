import { q } from '../_utils/db-node.js';

export default async function handler(req, res){
  if (req.method !== 'GET') return res.status(405).json({ ok:false, error:'Method Not Allowed' });
  try {
    const postsType = await q('SELECT pg_typeof(id) AS t FROM design_posts LIMIT 1');
    const assetsType = await q('SELECT pg_typeof(entry_id) AS t FROM design_assets LIMIT 1');
    const countPosts = await q('SELECT count(*)::int AS n FROM design_posts');
    const countAssets = await q('SELECT count(*)::int AS n FROM design_assets');
    res.json({
      ok: true,
      posts_id_type: postsType.rows[0]?.t || null,
      assets_entry_id_type: assetsType.rows[0]?.t || null,
      counts: { posts: countPosts.rows[0]?.n || 0, assets: countAssets.rows[0]?.n || 0 }
    });
  } catch (e) {
    res.status(500).json({ ok:false, error: e?.message || String(e) });
  }
}
