import { put } from '@vercel/blob';
import fs from 'fs';
import formidable from 'formidable';

export const config = {
  api: {
    bodyParser: false,
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok:false, error:'Method Not Allowed' });

  try {
    const form = formidable({ multiples: false, maxFileSize: 5 * 1024 * 1024, keepExtensions: true });
    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => err ? reject(err) : resolve({ fields, files }));
    });

    // 兼容不同字段名与数组情况
    const raw = (files && (files.file ?? files.upload ?? Object.values(files)[0])) || null;
    const f = Array.isArray(raw) ? raw[0] : raw;
    if (!f) return res.status(400).json({ ok:false, error:'no file' });

    const filePath = f.filepath || f.path || null;
    if (!filePath) return res.status(400).json({ ok:false, error:'temp path missing' });

    const size = (typeof f.size === 'number') ? f.size : (fs.existsSync(filePath) ? fs.statSync(filePath).size : 0);
    if (size > 5 * 1024 * 1024) return res.status(400).json({ ok:false, error:'too large' });

    const name = f.originalFilename || f.newFilename || 'upload.bin';
    const mime = f.mimetype || f.mime || 'application/octet-stream';
    const key = `open/${Date.now()}_${name}`;

    const stream = fs.createReadStream(filePath);
    const { url, pathname } = await put(key, stream, { access: 'public', contentType: mime });

    return res.json({ ok:true, url, storage_key: pathname, mime_type: mime, size_bytes: size });
  } catch (e) {
    console.error('open/upload error:', e);
    res.status(500).json({ ok:false, error: e?.message || String(e) });
  }
}
