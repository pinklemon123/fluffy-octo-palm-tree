import { q } from '../_utils/db-node.js';
import bcrypt from 'bcryptjs';
import { signToken } from '../_utils/auth-node.js';
export default async function handler(req,res){ if(req.method!=='POST') return res.status(405).end(); try{ const { username, password } = req.body || {}; const { rows } = await q('select id, password_hash from users where username=$1', [username]); if(!rows[0]) return res.status(401).json({ ok:false, error:'用户不存在或密码错误' }); const ok = await bcrypt.compare(password, rows[0].password_hash); if(!ok) return res.status(401).json({ ok:false, error:'用户不存在或密码错误' }); const token = signToken({ username }); res.json({ ok:true, token }); } catch(e){ res.status(500).json({ ok:false, error:e.message }); } }
