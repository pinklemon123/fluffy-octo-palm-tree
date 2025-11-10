const { getDB } = require('../_lib/mongo');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  try {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ error: 'username & password required' });
    const db = await getDB();
    const user = await db.collection('users').findOne({ username });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ uid: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ ok: true, token, profile: { username: user.username, avatarUrl: user.avatarUrl, bio: user.bio } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'server error' });
  }
};
