import { neon } from "@neondatabase/serverless";

export default async function handler(req, res){
  if (req.method !== 'POST') return res.status(405).end();
  try{
    const body = await readJson(req);
    const { user_id, display_name=null, bio=null, avatar_url=null } = body || {};
    if (!user_id) return res.status(400).json({ ok:false, error:"user_id required" });

    const sql = neon(process.env.DATABASE_URL);
    const r = await sql/*sql*/`
      update users set
        display_name = ${display_name},
        bio          = ${bio},
        avatar_url   = ${avatar_url}
      where id = ${user_id}
      returning id, username, display_name, bio, avatar_url, created_at
    `;
    if (!r.length) return res.status(404).json({ ok:false, error:"user not found" });
    res.json({ ok:true, user: r[0] });
  }catch(e){
    res.status(500).json({ ok:false, error:String(e?.message||e) });
  }
}

async function readJson(req){
  const chunks=[]; for await (const c of req) chunks.push(c);
  return JSON.parse(Buffer.concat(chunks).toString('utf8')||'{}');
}