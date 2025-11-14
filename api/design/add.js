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
    const file_id = body.file_id ? String(body.file_id) : null;
    const external_url = body.external_url ? String(body.external_url).trim() : null;

    if (!file_id && !external_url) {
      return res.status(400).json({ ok:false, error:'请提供文件或外部链接其一' });
    }

    // 解析文件类型（可选）
    let file_type = body.file_type ? String(body.file_type) : null;
    if (!file_type && file_id){
      try{
        const r = await q('SELECT mime, filename FROM files WHERE id=$1', [file_id]);
        if (r.rowCount > 0){
          const { mime, filename } = r.rows[0];
          file_type = mime || (filename && filename.split('.').pop()) || null;
        }
      }catch{}
    }

    const ins = await q(
      'INSERT INTO design_posts(description, file_id, external_url, file_type) VALUES ($1,$2,$3,$4) RETURNING id, description, file_id, external_url, file_type, created_at',
      [description || null, file_id, external_url, file_type]
    );
    const row = ins.rows[0];

    // 返回可直接用于渲染的URL
    let file_url = null;
    if (row.file_id) file_url = `/api/files/${row.file_id}`;

    res.json({ ok:true, post: { ...row, file_url } });
  }catch(e){
    console.error('design/add error:', e);
    res.status(500).json({ ok:false, error: e?.message || String(e) });
  }
}
