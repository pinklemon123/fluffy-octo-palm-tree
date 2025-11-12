import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const { content = '', image_url = null, username = null, user_id = null } = await readJson(req);
    if (!content.trim() && !image_url) {
      return res.status(400).json({ ok:false, error:"content or image required" });
    }

    const sql = neon(process.env.DATABASE_URL);

    // 轻校验：允许只给 username 或只给 user_id
    let u = null;
    if (user_id) {
      const r = await sql`select id, username from users where id = ${user_id} limit 1`;
      u = r[0] || null;
    } else if (username) {
      const r = await sql`select id, username from users where username = ${username} limit 1`;
      u = r[0] || null;
    }
    if (!u) return res.status(400).json({ ok:false, error:"invalid user" });

    const rows = await sql/*sql*/`
      insert into posts (content, image_url, user_id, username)
      values (${content}, ${image_url}, ${u.id}, ${u.username})
      returning id, content, image_url, username, user_id, created_at
    `;
    res.json({ ok:true, post: rows[0] });
  } catch (e) {
    res.status(500).json({ ok:false, error:String(e?.message||e) });
  }
}

async function readJson(req){
  const chunks=[]; for await (const c of req) chunks.push(c);
  return JSON.parse(Buffer.concat(chunks).toString('utf8')||'{}');
}