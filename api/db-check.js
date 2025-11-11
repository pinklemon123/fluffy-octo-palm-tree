import { q } from './_utils/db-node.js';
export default async function handler(req,res){ try{ const r = await q('select now() as now, current_user as user'); res.json({ ok:true, env: !!process.env.DATABASE_URL, row: r.rows[0] }); } catch(e){ res.status(500).json({ ok:false, env: !!process.env.DATABASE_URL, error: e.message }); } }
