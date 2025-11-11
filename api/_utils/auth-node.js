import jwt from 'jsonwebtoken';
export function signToken(payload){ return jwt.sign(payload, process.env.JWT_SECRET || 'dev', { expiresIn: '7d' }); }
export function requireUser(req){ const a = req.headers.authorization || ''; const t = a.startsWith('Bearer ') ? a.slice(7) : ''; if(!t) throw new Error('missing token'); const d = jwt.verify(t, process.env.JWT_SECRET || 'dev'); if(!d?.username) throw new Error('invalid token'); return d; }
export function requireAuth(req){ const a = req.headers.authorization || ''; const t = a.startsWith('Bearer ') ? a.slice(7) : ''; if(!t) throw new Error('missing token'); const d = jwt.verify(t, process.env.JWT_SECRET || 'dev'); if(!d?.sub) throw new Error('invalid token'); return d.sub; }
