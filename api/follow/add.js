const { getDB } = require('../_lib/mongo');
const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  try {
    const { target } = req.body || {};
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'no token' });
    let payload;
    try { payload = jwt.verify(token, process.env.JWT_SECRET); } 
    catch { return res.status(401).json({ error: 'bad token' }); }
    const db = await getDB();
    await db.collection('follows').insertOne({ follower: payload.username, following: target, createdAt: new Date() });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'server error' });
  }
};
