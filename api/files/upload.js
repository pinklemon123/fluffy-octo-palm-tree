import { IncomingForm } from 'formidable';
import { readFile } from 'fs/promises';
import { q } from '../_utils/db-node.js';

export const config = {
  api: {
    bodyParser: false,
  },
};

function parseForm(req) {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm({
      multiples: false,
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB 限制
    });
    
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  try {
    // ⛳ 轻量方案：只读取 X-User-Id，不做 JWT 校验
    const userId = req.headers['x-user-id'] || null;

    // 解析表单数据
    const { files } = await parseForm(req);
    const file = files.file;
    
    if (!file) {
      return res.status(400).json({ ok: false, error: '未选择文件' });
    }

    // 获取第一个文件（如果是数组）
    const fileObj = Array.isArray(file) ? file[0] : file;
    
    // 读取文件内容
    const buffer = await readFile(fileObj.filepath);
    const filename = fileObj.originalFilename || `upload-${Date.now()}`;
    const mimeType = fileObj.mimetype || 'application/octet-stream';
    const size = buffer.length;

    // 将文件存储到数据库（bytea 字段）
    const result = await q(
      'INSERT INTO files(user_id, filename, mime, size, data) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [userId, filename, mimeType, size, buffer]
    );

    const fileId = result.rows[0].id;

    res.json({
      ok: true,
      id: fileId,
      url: `/api/files/${fileId}`,
      file: {
        id: fileId,
        filename,
        mime: mimeType,
        size
      }
    });

  } catch (e) {
    console.error('upload error:', e);
    let msg = typeof e?.message === 'string' ? e.message : String(e);
    let code = 500;
    
    if (msg.includes('maxFileSize exceeded')) {
      code = 400;
      msg = '文件过大，请选择小于 10MB 的文件';
    }
    
    res.status(code).json({ ok: false, error: msg });
  }
}
