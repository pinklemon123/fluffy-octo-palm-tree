const { getDB } = require('../_lib/mongo');

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });
  try {
    const username = req.query.user;
    if (!username) return res.status(400).json({ error: 'Missing user' });
    const db = await getDB();
    const files = await db.collection('files').find({ user: username }).sort({ uploadedAt: -1 }).toArray();
    res.json({ ok: true, files });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'server error' });
  }
};
