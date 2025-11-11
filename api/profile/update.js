import { q } from '../_utils/db-node.js';
import { requireUser } from '../_utils/auth-node.js';
export default async function handler(req,res){ if(req.method!=='POST') return res.status(405).end(); try{ const me = requireUser(req); const { avatarUrl, bio } = req.body || {}; await q('update users set avatar_url=$1, bio=$2 where username=$3',[avatarUrl||null, bio||null, me]); res.json({ ok:true }); } catch(e){ const code = e.message==='missing token'?401:500; res.status(code).json({ ok:false, error:e.message }); } }
