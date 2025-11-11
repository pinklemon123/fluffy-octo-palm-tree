import { q } from '../_utils/db-node.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  try {
    // ⛳ 轻量方案：只读取 X-User-Id，不做 JWT 校验
    const userId = req.headers['x-user-id'] || null;
    const { content, fileId } = req.body || {};
    
    if (!content && !fileId) {
      return res.status(400).json({ ok: false, error: '内容与附件不能同时为空' });
    }
    
    // 直接使用 userId 创建帖子，允许匿名（userId 为 null）
    const ins = await q(
      'INSERT INTO posts(user_id, content, file_id) VALUES ($1, $2, $3) RETURNING id',
      [userId, content || '', fileId || null]
    );
    
    res.json({ ok: true, id: ins.rows[0].id });
  } catch (e) {
    console.error('create post error:', e);
    res.status(500).json({ ok: false, error: e.message });
  }
}
