import { requireUser } from '../_utils/auth-node.js';
import { q } from '../_utils/db-node.js';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
    }

    const user = requireUser(req);

    // 前端发送 JSON 格式的 base64 数据
    const { filename, mime, data } = req.body || {};
    
    if (!filename || !data) {
      return res.status(400).json({ 
        ok: false, 
        error: '缺少文件数据',
        received: Object.keys(req.body || {})
      });
    }

    // 检查文件大小（base64编码后大约比原文件大33%）
    const estimatedSize = (data.length * 3) / 4; // 估算原文件大小
    if (estimatedSize > 5 * 1024 * 1024) { // 5MB 限制
      return res.status(400).json({ 
        ok: false, 
        error: '文件过大，请选择小于 5MB 的文件' 
      });
    }

    // 获取用户ID
    const userRows = await q('SELECT id FROM users WHERE username = $1', [user.username]);
    if (!userRows.rows[0]) {
      return res.status(401).json({ ok: false, error: '用户不存在' });
    }

    const user_id = userRows.rows[0].id;

    // 插入文件记录到数据库
    const result = await q(
      'INSERT INTO files(user_id, filename, mime, data, url) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [user_id, filename, mime, data, null]
    );

    res.json({
      ok: true,
      id: result.rows[0].id,
      file: {
        id: result.rows[0].id,
        filename,
        mime
      }
    });

  } catch (e) {
    console.error('upload error:', e);
    const msg = typeof e?.message === 'string' ? e.message : String(e);
    const code = msg.includes('missing token') || msg.includes('invalid token') ? 401 : 500;
    res.status(code).json({ ok: false, error: msg });
  }
}
