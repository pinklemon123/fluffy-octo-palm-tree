const { getDB } = require('../_lib/mongo');
const bcrypt = require('bcryptjs');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  try {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ error: 'username & password required' });
    const db = await getDB();
    const users = db.collection('users');

    const exists = await users.findOne({ username });
    if (exists) return res.status(409).json({ error: 'Username taken' });

    const hash = await bcrypt.hash(password, 10);
    const user = {
      username,
      password: hash,
      avatarUrl: '',
      bio: '',
      createdAt: new Date()
    };
    await users.insertOne(user);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'server error' });
  }
};
