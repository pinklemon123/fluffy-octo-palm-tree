import { q } from '../_utils/db-node.js';

export default async function handler(req, res){
  if (req.method !== 'GET') return res.status(405).json({ ok:false, error:'Method Not Allowed' });
  try {
    const postsType = await q('SELECT pg_typeof(id) AS t FROM design_posts LIMIT 1');
    const assetsType = await q('SELECT pg_typeof(entry_id) AS t FROM design_assets LIMIT 1');
    const filesType = await q('SELECT pg_typeof(id) AS t FROM files LIMIT 1');

    const postsCols = await q(`
      SELECT column_name, data_type, udt_name
      FROM information_schema.columns
      WHERE table_schema='public' AND table_name='design_posts'
      ORDER BY ordinal_position
    `);
    const assetsCols = await q(`
      SELECT column_name, data_type, udt_name
      FROM information_schema.columns
      WHERE table_schema='public' AND table_name='design_assets'
      ORDER BY ordinal_position
    `);
    const filesCols = await q(`
      SELECT column_name, data_type, udt_name
      FROM information_schema.columns
      WHERE table_schema='public' AND table_name='files'
      ORDER BY ordinal_position
    `);

    const countPosts = await q('SELECT count(*)::int AS n FROM design_posts');
    const countAssets = await q('SELECT count(*)::int AS n FROM design_assets');
    const countFiles = await q('SELECT count(*)::int AS n FROM files');

    res.json({
      ok: true,
      types: {
        posts_id: postsType.rows[0]?.t || null,
        assets_entry_id: assetsType.rows[0]?.t || null,
        files_id: filesType.rows[0]?.t || null,
      },
      columns: {
        design_posts: postsCols.rows,
        design_assets: assetsCols.rows,
        files: filesCols.rows,
      },
      counts: { posts: countPosts.rows[0]?.n || 0, assets: countAssets.rows[0]?.n || 0, files: countFiles.rows[0]?.n || 0 }
    });
  } catch (e) {
    res.status(500).json({ ok:false, error: e?.message || String(e) });
  }
}
