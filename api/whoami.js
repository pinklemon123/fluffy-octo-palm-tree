import { requireUser } from './_utils/auth-node.js';
export default async function handler(req,res){ try{ const u = requireUser(req); res.json({ ok:true, user:u }); } catch(e){ res.status(401).json({ ok:false, error:e.message }); } }
