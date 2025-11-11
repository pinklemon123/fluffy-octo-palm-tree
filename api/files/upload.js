const formidable = require('formidable');
const fs = require('fs');
const { query } = require('../_lib/db');
const { requireUser } = require('../_lib/auth');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method Not Allowed' });
    return;
  }
  try {
    const user = requireUser(req);
    const form = formidable({ multiples: false });
    form.parse(req, async (err, fields, files) => {
      try {
        if (err) {
          console.error('formidable error', err);
          res.status(400).json({ ok: false, error: '上传失败' });
          return;
        }
        const file = files.file;
        if (!file) {
          res.status(400).json({ ok: false, error: '请选择文件' });
          return;
        }
        const filename = file.originalFilename || file.newFilename || '未命名文件';
        const mime = file.mimetype || 'application/octet-stream';
        const { rows } = await query(
          'insert into files (user_id, filename, mime, url) values ($1, $2, $3, $4) returning id, filename, mime, url',
          [user.id, filename, mime, '']
        );
        if (file.filepath) {
          fs.unlink(file.filepath, () => {});
        }
        res.json({ ok: true, file: rows[0] });
      } catch (innerError) {
        const status = innerError.statusCode || 500;
        console.error('upload error', innerError);
        res.status(status).json({ ok: false, error: status === 401 ? innerError.message : '服务器错误' });
      }
    });
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({ ok: false, error: status === 401 ? error.message : '服务器错误' });
  }
};
