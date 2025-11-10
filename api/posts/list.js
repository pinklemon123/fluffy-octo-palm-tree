const { getDB } = require('../_lib/mongo');

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });
  try {
    const db = await getDB();
    const limit = Math.min(parseInt(req.query.limit || '50', 10), 200);
    const list = await db.collection('posts').find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
    res.json({ ok: true, data: list });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'server error' });
  }
};
