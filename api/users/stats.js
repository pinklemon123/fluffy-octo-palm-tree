import { neon } from "@neondatabase/serverless";

export default async function handler(req,res){
  try{
    const { user_id } = req.query;
    if (!user_id) return res.status(400).json({ ok:false, error:"user_id required" });
    const sql = neon(process.env.DATABASE_URL);
    const [{ n_posts }]     = await sql`select count(*)::int as n_posts from posts where user_id=${user_id}`;
    const [{ n_followers }] = await sql`select count(*)::int as n_followers from follows where followee_id=${user_id}`;
    const [{ n_following }] = await sql`select count(*)::int as n_following from follows where follower_id=${user_id}`;
    res.json({ ok:true, n_posts, n_followers, n_following });
  }catch(e){ 
    res.status(500).json({ ok:false, error:String(e?.message||e) }); 
  }
}