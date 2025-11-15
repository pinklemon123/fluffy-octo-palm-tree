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

    // 直接转为 data:URL，避免外部存储依赖
    const buffer = await fs.promises.readFile(filePath);
    const base64 = buffer.toString('base64');
    const url = `data:${mime};base64,${base64}`;

    return res.json({ ok:true, url, storage_key: null, mime_type: mime, size_bytes: size, name });
  } catch (e) {
    console.error('open/upload error:', e);
    res.status(500).json({ ok:false, error: e?.message || String(e) });
  }
}
