import { q } from '../_utils/db-node.js';

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
    }

    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ ok: false, error: '缺少文件ID' });
    }

    // 从数据库获取文件
    const result = await q(
      'SELECT filename, mime, size, data FROM files WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, error: '文件不存在' });
    }

    const file = result.rows[0];
    const fileData = file.data; // PostgreSQL bytea 字段自动转为 Buffer

    // 设置响应头
    res.setHeader('Content-Type', file.mime || 'application/octet-stream');
    res.setHeader('Content-Length', String(file.size));
    res.setHeader('Content-Disposition', `inline; filename*=UTF-8''${encodeURIComponent(file.filename)}`);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

    // 返回文件数据
    res.status(200).send(fileData);

  } catch (e) {
    console.error('file access error:', e);
    const msg = typeof e?.message === 'string' ? e.message : String(e);
    res.status(500).json({ ok: false, error: msg });
  }
}