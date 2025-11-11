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

    // 检查用户是否存在
    const { rows } = await q('SELECT id, username, password_hash FROM users WHERE username=$1', [username]);
    
    let userId;
    let isNewUser = false;

    if (rows.length === 0) {
      // 🎯 第一次登录：自动注册
      const hash = await bcrypt.hash(password, 10);
      const newUser = await q(
        'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username',
        [username, hash]
      );
      userId = newUser.rows[0].id;
      isNewUser = true;
      console.log(`Auto-registered new user: ${username} (${userId})`);
    } else {
      // 已存在用户：校验密码
      const user = rows[0];
      const passwordMatch = await bcrypt.compare(password, user.password_hash);
      
      if (!passwordMatch) {
        return res.status(401).json({ ok: false, error: '密码错误' });
      }
      
      userId = user.id;
    }

    // 生成 JWT token
    const token = signToken({ sub: userId, username: username });
    
    res.json({ 
      ok: true, 
      token, 
      userId: userId,  // ⛳ 重要：返回 userId 供前端存储
      user: {
        id: userId,
        username: username
      },
      isNewUser  // 可选：告诉前端是否为新用户
    });
  } catch (e) {
    console.error('Login error:', e);
    res.status(500).json({ ok: false, error: '服务器错误' });
  }
}
