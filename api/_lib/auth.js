const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

function signToken(user) {
  return jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
}

function requireUser(req) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) {
    const err = new Error('未登录');
    err.statusCode = 401;
    throw err;
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded?.id || !decoded?.username) throw new Error('token 无效');
    return decoded;
  } catch (error) {
    const err = new Error('登录已失效');
    err.statusCode = 401;
    throw err;
  }
}

module.exports = {
  signToken,
  requireUser
};
