import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
  try {
    const { username } = req.query;
    if (!username) return res.status(400).json({ ok:false, error:"username required" });

    const sql = neon(process.env.DATABASE_URL);
    const rows = await sql/*sql*/`
      select id, username, display_name, avatar_url, bio, created_at
      from users
      where username = ${username}
      limit 1
    `;
    if (!rows.length) return res.status(404).json({ ok:false, error:"User not found" });
    res.json({ ok:true, user: rows[0] });
  } catch (e) {
    res.status(500).json({ ok:false, error: String(e?.message||e) });
  }
}