import jwt from 'jsonwebtoken';

export function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
}

export function requireUser(req) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) throw new Error('missing token');
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (!decoded?.username) throw new Error('invalid token');
  return decoded.username;
}
