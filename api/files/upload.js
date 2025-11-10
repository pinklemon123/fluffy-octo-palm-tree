const { getDB } = require('../_lib/mongo');
const jwt = require('jsonwebtoken');
const formidable = require('formidable');
const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'no token' });
    let payload;
    try { payload = jwt.verify(token, process.env.JWT_SECRET); } 
    catch { return res.status(401).json({ error: 'bad token' }); }

    const form = formidable({ multiples: false });
    form.parse(req, async (err, fields, files) => {
      if (err) return res.status(400).json({ error: 'upload error' });
      const file = files.file;
      if (!file) return res.status(400).json({ error: 'no file' });
      // 这里只存元数据，实际可接入外部存储
      const db = await getDB();
      const doc = {
        user: payload.username,
        filename: file.originalFilename,
        mime: file.mimetype,
        url: '', // 可存外链或Base64，演示用
        uploadedAt: new Date()
      };
      await db.collection('files').insertOne(doc);
      res.json({ ok: true });
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'server error' });
  }
};
