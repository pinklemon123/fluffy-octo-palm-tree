const { getDB } = require('../_lib/mongo');

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });
  try {
    const username = req.query.user;
    if (!username) return res.status(400).json({ error: 'Missing user' });
    const db = await getDB();
    const user = await db.collection('users').findOne({ username });
    if (!user) return res.json({ ok: false });
    res.json({ ok: true, profile: { username: user.username, avatarUrl: user.avatarUrl, bio: user.bio } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'server error' });
  }
};
