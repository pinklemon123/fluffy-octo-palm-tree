import { neon } from "@neondatabase/serverless";

export default async function handler(req,res){
  if (req.method !== 'POST') return res.status(405).end();
  try{
    const { follower_id, followee_id } = await readJson(req);
    if (!follower_id || !followee_id || follower_id === followee_id)
      return res.status(400).json({ ok:false, error:"bad ids" });

    const sql = neon(process.env.DATABASE_URL);

    // 确认两端用户存在
    const u = await sql`select id from users where id in (${follower_id}, ${followee_id})`;
    if (u.length < 2) return res.status(400).json({ ok:false, error:"user not exist" });

    // 切换
    const exist = await sql`select 1 from follows where follower_id=${follower_id} and followee_id=${followee_id}`;
    if (exist.length){
      await sql`delete from follows where follower_id=${follower_id} and followee_id=${followee_id}`;
      return res.json({ ok:true, followed:false });
    }else{
      await sql`insert into follows(follower_id, followee_id) values (${follower_id}, ${followee_id})`;
      return res.json({ ok:true, followed:true });
    }
  }catch(e){
    res.status(500).json({ ok:false, error:String(e?.message||e) })
  }
}

async function readJson(req){
  const chunks=[]; for await (const c of req) chunks.push(c);
  return JSON.parse(Buffer.concat(chunks).toString('utf8')||'{}');
}