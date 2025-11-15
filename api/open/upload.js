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
    const form = formidable({ multiples: false, maxFileSize: 5 * 1024 * 1024 });
    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => err ? reject(err) : resolve({ fields, files }));
    });

    const f = files.file || files.upload || Object.values(files)[0];
    if (!f) return res.status(400).json({ ok:false, error:'no file' });

    const size = f.size ?? f.filepath ? fs.statSync(f.filepath).size : 0;
    if (size > 5 * 1024 * 1024) return res.status(400).json({ ok:false, error:'too large' });

    const name = f.originalFilename || 'upload.bin';
    const mime = f.mimetype || 'application/octet-stream';
    const key = `open/${Date.now()}_${name}`;

    const stream = fs.createReadStream(f.filepath || f.path);

    const { url, pathname } = await put(key, stream, { access: 'public', contentType: mime });

    return res.json({ ok:true, url, storage_key: pathname, mime_type: mime, size_bytes: size });
  } catch (e) {
    console.error('open/upload error:', e);
    res.status(500).json({ ok:false, error: e?.message || String(e) });
  }
}
