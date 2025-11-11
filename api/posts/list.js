import { q } from '../_utils/db-node.js';
export default async function handler(req,res){ try{ const { rows } = await q('select * from posts_view order by created_at desc limit 100'); res.json({ ok:true, data: rows }); } catch(e){ res.status(500).json({ ok:false, error:e.message }); } }
