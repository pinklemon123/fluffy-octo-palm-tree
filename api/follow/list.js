import { neon } from "@neondatabase/serverless";

export default async function handler(req,res){
  try{
    const { user_id, type='following' } = req.query;
    if (!user_id) return res.status(400).json({ ok:false, error:"user_id required" });
    const sql = neon(process.env.DATABASE_URL);

    if (type === 'followers'){
      const rows = await sql/*sql*/`
        select u.id, u.username, u.display_name, u.avatar_url
        from follows f
        join users u on u.id = f.follower_id
        where f.followee_id = ${user_id}
        order by f.created_at desc
      `;
      return res.json({ ok:true, users: rows });
    } else {
      const rows = await sql/*sql*/`
        select u.id, u.username, u.display_name, u.avatar_url
        from follows f
        join users u on u.id = f.followee_id
        where f.follower_id = ${user_id}
        order by f.created_at desc
      `;
      return res.json({ ok:true, users: rows });
    }
  }catch(e){
    res.status(500).json({ ok:false, error:String(e?.message||e) })
  }
}
