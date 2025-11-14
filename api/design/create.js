import { q } from '../_utils/db-node.js';

export default async function handler(req, res){
  if (req.method !== 'POST') return res.status(405).json({ ok:false, error:'Method Not Allowed' });
  try{
    const text = await new Promise((resolve)=>{
      let data='';
      req.on('data', chunk => data += chunk);
      req.on('end', () => resolve(data || '{}'));
    });
    let body; try{ body = JSON.parse(text) } catch { body = {} }

    const description = (body.description || '').toString().trim();
    const external_url = body.external_url ? String(body.external_url).trim() : null;
    const asset = body.asset || null; // { url, mime_type, size_bytes, storage_key }

    if (!asset && !external_url) {
      return res.status(400).json({ ok:false, error:'请提供文件或外部链接其一' });
    }

    if (asset?.size_bytes && asset.size_bytes > 5*1024*1024) {
      return res.status(400).json({ ok:false, error:'文件过大，最大 5MB' });
    }

    const file_type = asset?.mime_type || null;

    const ins = await q(
      'INSERT INTO design_posts(description, file_id, external_url, file_type) VALUES ($1,$2,$3,$4) RETURNING id, description, file_id, external_url, file_type, created_at',
      [description || null, null, external_url, file_type]
    );
    const post = ins.rows[0];

    let file_url = null;
    if (asset?.url) {
      await q(
        'INSERT INTO design_assets(entry_id, storage_key, url, mime_type, size_bytes) VALUES ($1,$2,$3,$4,$5)',
        [post.id, asset.storage_key || null, asset.url, asset.mime_type || null, asset.size_bytes || 0]
      );
      file_url = asset.url;
    }

    res.json({ ok:true, post: { ...post, file_url } });
  }catch(e){
    console.error('design/create error:', e);
    res.status(500).json({ ok:false, error: e?.message || String(e) });
  }
}
