import { jwtVerify } from 'jose';

export async function requireUserEdge(req) {
  const auth = req.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) throw new Error('missing token');
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  const { payload } = await jwtVerify(token, secret);
  if (!payload?.username) throw new Error('invalid token');
  return payload.username;
}
