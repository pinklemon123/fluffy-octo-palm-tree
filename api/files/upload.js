import { requireUser } from '../_utils/auth-node.js';
import { q } from '../_utils/db-node.js';
import { put } from '@vercel/blob';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
    }

    const user = requireUser(req);

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return res.status(500).json({ ok: false, error: '未配置 BLOB_READ_WRITE_TOKEN' });
    }

    // 检查 Content-Type
    const contentType = req.headers['content-type'] || '';
    if (!contentType.includes('multipart/form-data')) {
      return res.status(400).json({ 
        ok: false, 
        error: `Content-Type 非 multipart/form-data: ${contentType}` 
      });
    }

    // 读取原始请求体
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    
    if (buffer.length === 0) {
      return res.status(400).json({ ok: false, error: '请求体为空' });
    }

    // 解析 boundary
    const boundary = contentType.split('boundary=')[1];
    if (!boundary) {
      return res.status(400).json({ ok: false, error: '无效的 multipart boundary' });
    }

    // 简化的 multipart 解析
    const boundaryBytes = Buffer.from(`\r\n--${boundary}`);
    const parts = buffer.split(boundaryBytes);
    
    let fileData = null;
    let filename = `upload-${Date.now()}`;
    let mimeType = 'application/octet-stream';

    for (const part of parts) {
      const partStr = part.toString();
      
      // 查找包含文件的部分
      if (partStr.includes('name="file"') && partStr.includes('Content-Type:')) {
        // 提取文件名
        const filenameMatch = partStr.match(/filename="([^"]+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
        
        // 提取 MIME 类型
        const mimeMatch = partStr.match(/Content-Type:\s*([^\r\n]+)/i);
        if (mimeMatch) {
          mimeType = mimeMatch[1].trim();
        }
        
        // 找到文件数据（在双 CRLF 之后）
        const headerEndIndex = part.indexOf(Buffer.from('\r\n\r\n'));
        if (headerEndIndex !== -1) {
          fileData = part.slice(headerEndIndex + 4);
          // 移除末尾的 CRLF
          if (fileData.length >= 2) {
            const end = fileData.slice(-2);
            if (end[0] === 0x0D && end[1] === 0x0A) {
              fileData = fileData.slice(0, -2);
            }
          }
          break;
        }
      }
    }

    if (!fileData || fileData.length === 0) {
      return res.status(400).json({ 
        ok: false, 
        error: '未找到文件数据',
        debug: { 
          boundary, 
          partsCount: parts.length,
          bufferSize: buffer.length,
          contentType 
        }
      });
    }

    // 上传到 Vercel Blob
    const { url } = await put(filename, fileData, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN
    });

    // 保存到数据库
    const userRows = await q('SELECT id FROM users WHERE username = $1', [user.username]);
    if (!userRows.rows[0]) {
      return res.status(401).json({ ok: false, error: '用户不存在' });
    }

    const user_id = userRows.rows[0].id;
    const result = await q(
      'INSERT INTO files(user_id, filename, mime, url) VALUES ($1, $2, $3, $4) RETURNING id',
      [user_id, filename, mimeType, url]
    );

    res.json({
      ok: true,
      id: result.rows[0].id,
      file: {
        id: result.rows[0].id,
        url,
        mime: mimeType,
        filename
      }
    });

  } catch (e) {
    console.error('upload error:', e);
    const msg = typeof e?.message === 'string' ? e.message : String(e);
    const code = msg.includes('missing token') || msg.includes('invalid token') ? 401 : 500;
    res.status(code).json({ ok: false, error: msg });
  }
}
