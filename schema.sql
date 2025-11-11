-- === 基础：扩展 & 时区 ===
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
SET TIME ZONE 'UTC';

-- === 用户表 ===
CREATE TABLE IF NOT EXISTS users (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  username      text UNIQUE NOT NULL CHECK (length(username) BETWEEN 1 AND 32),
  password_hash text NOT NULL,
  avatar_url    text,
  bio           text,
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_users_username ON users (username);

-- === 文件表 ===
CREATE TABLE IF NOT EXISTS files (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  filename   text NOT NULL,
  mime       text NOT NULL,
  url        text,
  data       text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_files_user ON files(user_id, created_at DESC);

-- === 帖子表 ===
CREATE TABLE IF NOT EXISTS posts (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content    text NOT NULL,
  file_id    uuid REFERENCES files(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_user ON posts(user_id, created_at DESC);

-- === 关注表 ===
CREATE TABLE IF NOT EXISTS follows (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id  uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at   timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT follows_unique UNIQUE (follower_id, following_id),
  CONSTRAINT follows_self CHECK (follower_id <> following_id)
);
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);

-- === 视图 ===
CREATE OR REPLACE VIEW posts_view AS
SELECT
  p.id,
  p.content,
  p.created_at,
  jsonb_build_object('username', u.username) AS "user",
  CASE WHEN f.id IS NOT NULL THEN jsonb_build_object('id', f.id, 'url', f.url, 'mime', f.mime, 'filename', f.filename, 'data', f.data) END AS "file"
FROM posts p
JOIN users u ON u.id = p.user_id
LEFT JOIN files f ON f.id = p.file_id
ORDER BY p.created_at DESC;

CREATE OR REPLACE VIEW user_files_view AS
SELECT f.id, f.filename, f.mime, f.url, f.data, f.created_at, u.username
FROM files f JOIN users u ON u.id = f.user_id
ORDER BY f.created_at DESC;

CREATE OR REPLACE VIEW follows_view AS
SELECT uf.username AS follower, ut.username AS following, fo.created_at
FROM follows fo
JOIN users uf ON uf.id = fo.follower_id
JOIN users ut ON ut.id = fo.following_id;
