import { q } from '../_utils/db-node.js';
import bcrypt from 'bcryptjs';
import { signToken } from '../_utils/auth-node.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ ok: false, error: '用户名和密码不能为空' });
    }

    const { rows } = await q('select id, username, password_hash from users where username=$1', [username]);
    
    if (!rows[0]) {
      return res.status(401).json({ ok: false, error: '用户不存在或密码错误' });
    }

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    
    if (!ok) {
      return res.status(401).json({ ok: false, error: '用户不存在或密码错误' });
    }

    // JWT payload 包含 userId 和 username
    const token = signToken({ userId: user.id, username: user.username });
    
    res.json({ 
      ok: true, 
      token, 
      user: {
        id: user.id,
        username: user.username
      }
    });
  } catch (e) {
    console.error('Login error:', e);
    res.status(500).json({ ok: false, error: '服务器错误' });
  }
}
