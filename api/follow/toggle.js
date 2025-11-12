import { neon } from "@neondatabase/serverless";

export default async function handler(req,res){
  if (req.method !== 'POST') return res.status(405).end();
  try{
    const b = await readJson(req);
    const { follower_id, followee_id } = b || {};
    if (!follower_id || !followee_id || follower_id === followee_id)
      return res.status(400).json({ ok:false, error:"bad ids" });

    const sql = neon(process.env.DATABASE_URL);
    const ex = await sql`select 1 from follows where follower_id=${follower_id} and followee_id=${followee_id}`;
    if (ex.length){
      await sql`delete from follows where follower_id=${follower_id} and followee_id=${followee_id}`;
      return res.json({ ok:true, followed:false });
    } else {
      await sql`insert into follows(follower_id, followee_id) values (${follower_id}, ${followee_id})`;
      return res.json({ ok:true, followed:true });
    }
  }catch(e){ 
    res.status(500).json({ ok:false, error:String(e?.message||e) }); 
  }
}

async function readJson(req){ 
  const c=[]; 
  for await (const x of req) c.push(x); 
  return JSON.parse(Buffer.concat(c).toString('utf8')||'{}'); 
}