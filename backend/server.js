// 极简 Node/Express 后端，直连 Neon，支持 JWT 登录
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const formidable = require('formidable');
const fs = require('fs');
const path = require('path');

const app = express();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set. Please provide your Neon connection string.');
}

const pool = new Pool({
  connectionString,
  max: Number(process.env.PGPOOL_MAX || 10),
  idleTimeoutMillis: Number(process.env.PGPOOL_IDLE_TIMEOUT || 30_000),
  connectionTimeoutMillis: Number(process.env.PGPOOL_CONNECTION_TIMEOUT || 5_000),
  ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false }
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
});

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const JWT_SECRET = process.env.JWT_SECRET || 'forum-secret';

const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean)
  : '*';

app.use(cors({ origin: corsOrigins }));
app.use(express.json());

function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ ok: false, error: '未登录' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ ok: false, error: '无效token' });
  }
}

// 注册
app.post('/api/users/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password || password.length < 6) return res.json({ ok: false, error: '用户名必填，密码至少6位' });
  const hash = await bcrypt.hash(password, 10);
  try {
    await pool.query('INSERT INTO users (username, password_hash) VALUES ($1, $2)', [username, hash]);
    res.json({ ok: true });
  } catch (e) {
    res.json({ ok: false, error: '用户名已存在' });
  }
});

// 登录
app.post('/api/users/login', async (req, res) => {
  const { username, password } = req.body;
  const r = await pool.query('SELECT * FROM users WHERE username=$1', [username]);
  const user = r.rows[0];
  if (!user) return res.json({ ok: false, error: '用户不存在' });
  if (!(await bcrypt.compare(password, user.password_hash))) return res.json({ ok: false, error: '密码错误' });
  const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ ok: true, token });
});

// 发帖
app.post('/api/posts/create', auth, async (req, res) => {
  const { content, fileId } = req.body;
  if (!content && !fileId) return res.json({ ok: false, error: '内容或附件必填' });
  const ur = await pool.query('SELECT id FROM users WHERE username=$1', [req.user.username]);
  const userId = ur.rows[0]?.id;
  if (!userId) return res.json({ ok: false, error: '用户不存在' });
  const r = await pool.query('INSERT INTO posts (user_id, content, file_id) VALUES ($1, $2, $3) RETURNING id', [userId, content, fileId || null]);
  res.json({ ok: true, id: r.rows[0].id });
});

// 帖子列表
app.get('/api/posts/list', async (req, res) => {
  const r = await pool.query('SELECT * FROM posts_view LIMIT 50');
  res.json({ ok: true, data: r.rows });
});

// 个人资料
app.get('/api/profile/view', async (req, res) => {
  const username = req.query.user;
  const r = await pool.query('SELECT username, avatar_url AS "avatarUrl", bio FROM users WHERE username=$1', [username]);
  if (!r.rows[0]) return res.json({ ok: false, error: '用户不存在' });
  res.json({ ok: true, profile: r.rows[0] });
});

// 资料编辑
app.post('/api/profile/update', auth, async (req, res) => {
  const { avatarUrl, bio } = req.body;
  await pool.query('UPDATE users SET avatar_url=$1, bio=$2 WHERE username=$3', [avatarUrl, bio, req.user.username]);
  res.json({ ok: true });
});

// 文件列表
app.get('/api/files/list', async (req, res) => {
  const username = req.query.user;
  const r = await pool.query('SELECT id, filename, mime, url, created_at, username FROM user_files_view WHERE username=$1', [username]);
  res.json({ ok: true, files: r.rows });
});

// 文件上传（本地存储，生产建议用云存储）
app.post('/api/files/upload', auth, (req, res) => {
  const form = formidable({ uploadDir: uploadsDir, keepExtensions: true });
  form.parse(req, async (err, fields, files) => {
    if (err || !files.file) return res.json({ ok: false, error: '上传失败' });
    const file = files.file;
    const ur = await pool.query('SELECT id FROM users WHERE username=$1', [req.user.username]);
    const userId = ur.rows[0]?.id;
    if (!userId) return res.json({ ok: false, error: '用户不存在' });
    const url = '/uploads/' + path.basename(file.filepath);
    const r = await pool.query('INSERT INTO files (user_id, filename, mime, url) VALUES ($1, $2, $3, $4) RETURNING id', [userId, file.originalFilename, file.mimetype, url]);
    res.json({ ok: true, id: r.rows[0].id, file: { id: r.rows[0].id, url, mime: file.mimetype, filename: file.originalFilename } });
  });
});
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 关注列表
app.get('/api/follow/list', async (req, res) => {
  const username = req.query.user;
  const r = await pool.query('SELECT following FROM follows_view WHERE follower=$1', [username]);
  res.json({ ok: true, follows: r.rows });
});

// 关注
app.post('/api/follow/add', auth, async (req, res) => {
  const target = req.body.target;
  if (!target || target === req.user.username) return res.json({ ok: false, error: '目标无效' });
  const ur = await pool.query('SELECT id FROM users WHERE username=$1', [req.user.username]);
  const tr = await pool.query('SELECT id FROM users WHERE username=$1', [target]);
  const followerId = ur.rows[0]?.id, followingId = tr.rows[0]?.id;
  if (!followerId || !followingId) return res.json({ ok: false, error: '用户不存在' });
  try {
    await pool.query('INSERT INTO follows (follower_id, following_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [followerId, followingId]);
    res.json({ ok: true });
  } catch {
    res.json({ ok: false, error: '关注失败' });
  }
});

// 取关
app.post('/api/follow/remove', auth, async (req, res) => {
  const target = req.body.target;
  const ur = await pool.query('SELECT id FROM users WHERE username=$1', [req.user.username]);
  const tr = await pool.query('SELECT id FROM users WHERE username=$1', [target]);
  const followerId = ur.rows[0]?.id, followingId = tr.rows[0]?.id;
  if (!followerId || !followingId) return res.json({ ok: false, error: '用户不存在' });
  await pool.query('DELETE FROM follows WHERE follower_id=$1 AND following_id=$2', [followerId, followingId]);
  res.json({ ok: true });
});

app.get('/api/health', async (req, res) => {
  try {
    const r = await pool.query('SELECT current_database() AS db, current_user AS role');
    res.json({ ok: true, database: r.rows[0] });
  } catch (error) {
    console.error('Health check failed', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Forum server running on port', PORT));
