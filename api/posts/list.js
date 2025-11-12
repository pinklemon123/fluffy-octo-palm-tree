import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
  try {
    const sql = neon(process.env.DATABASE_URL);
    const rows = await sql/*sql*/`
      select id, content, image_url, username, user_id, created_at
      from posts
      order by id desc
      limit 200
    `;
    res.json({ ok:true, data: rows });
  } catch (e) {
    res.status(500).json({ ok:false, error:String(e?.message||e) });
  }
}
