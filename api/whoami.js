const { requireUser } = require('./_lib/auth');

module.exports = async (req, res) => {
  try {
    const user = requireUser(req);
    res.json({ ok: true, user: user.username });
  } catch (error) {
    const status = error.statusCode || 401;
    res.status(status).json({ ok: false, error: status === 401 ? error.message : '服务器错误' });
  }
};
