import { requireUser } from '../_utils/auth-node.js';
import { q } from '../_utils/db-node.js';
import { put } from '@vercel/blob';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return res.status(500).json({ ok: false, error: '未配置 BLOB_READ_WRITE_TOKEN' });
    }

    const user = requireUser(req);

    // 从请求体获取文件数据
    if (!req.body) {
      return res.status(400).json({ ok: false, error: '缺少文件数据' });
    }

    const filename = req.headers['x-filename'] || `upload-${Date.now()}.bin`;
    const contentType = req.headers['content-type'] || 'application/octet-stream';
    
    const { url } = await put(filename, req.body, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN
    });

    const userRows = await q('SELECT id FROM users WHERE username = $1', [user.username]);
    if (!userRows.rows[0]) {
      return res.status(401).json({ ok: false, error: '用户不存在' });
    }

    const user_id = userRows.rows[0].id;
    
    const result = await q(
      'INSERT INTO files(user_id, filename, mime, url) VALUES ($1, $2, $3, $4) RETURNING id',
      [user_id, filename, contentType, url]
    );

    res.json({
      ok: true,
      id: result.rows[0].id,
      file: {
        id: result.rows[0].id,
        url,
        mime: contentType,
        filename
      }
    });
  } catch (e) {
    const msg = typeof e?.message === 'string' ? e.message : String(e);
    const code = msg.includes('missing token') || msg.includes('invalid token') ? 401 : 500;
    res.status(code).json({ ok: false, error: msg });
  }
}
