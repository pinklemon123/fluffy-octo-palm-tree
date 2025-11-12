import { neon } from "@neondatabase/serverless";

export default async function handler(req, res){
  try{
    const { follower_id, followee_id } = req.query;
    if (!follower_id || !followee_id || follower_id === followee_id) {
      return res.status(400).json({ ok:false, error:"bad ids" });
    }
    const sql = neon(process.env.DATABASE_URL);
    const r = await sql`
      select 1 from follows where follower_id=${follower_id} and followee_id=${followee_id} limit 1
    `;
    res.json({ ok:true, followed: !!r.length });
  }catch(e){
    res.status(500).json({ ok:false, error:String(e?.message||e) });
  }
}