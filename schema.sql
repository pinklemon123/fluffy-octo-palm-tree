-- === 基础：扩展 & 时区 ===
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
SET TIME ZONE 'UTC';

-- === 用户表（统一结构）===
CREATE TABLE IF NOT EXISTS users (
  id            text PRIMARY KEY,                           -- 使用text作为主键，更灵活
  username      text UNIQUE NOT NULL CHECK (length(username) BETWEEN 1 AND 32),
  display_name  text,                                       -- 显示名称
  password_hash text,                                       -- 密码哈希（可选）
  avatar_url    text,
  bio           text,
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_users_username ON users (username);

-- === 帖子表（支持冗余username）===
CREATE TABLE IF NOT EXISTS posts (
  id         bigserial PRIMARY KEY,
  content    text DEFAULT '',
  image_url  text,                                          -- 图片URL
  user_id    text,                                          -- 引用 users.id（不强制外键）
  username   text,                                          -- 冗余username，方便渲染
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_user ON posts(user_id, created_at DESC);

-- === 关注表（统一结构）===
CREATE TABLE IF NOT EXISTS follows (
  follower_id  text NOT NULL,                               -- 关注者（谁在关注）
  followee_id  text NOT NULL,                               -- 被关注者
  created_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, followee_id),
  CONSTRAINT follows_self CHECK (follower_id <> followee_id)
);

-- 如果之前建过其他名字的列，统一改名（按需执行）
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='follows' AND column_name='following_id')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='follows' AND column_name='followee_id')
  THEN
    EXECUTE 'ALTER TABLE public.follows RENAME COLUMN following_id TO followee_id';
  END IF;
END$$;

-- 索引（提升列表/计数性能）
CREATE INDEX IF NOT EXISTS idx_follows_followee ON follows(followee_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);

-- === 文件表（可选，如果需要文件上传）===
CREATE TABLE IF NOT EXISTS files (
  id         text PRIMARY KEY,
  user_id    text,                                          -- 引用 users.id
  filename   text NOT NULL,
  mime       text NOT NULL,
  size       integer NOT NULL CHECK (size >= 0),
  data       bytea NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_files_user ON files(user_id, created_at DESC);

-- === 数据回填（修复历史数据）===
-- 如果 posts.user_id 存在且能对上 users.id，用它补 username
UPDATE posts p
SET username = u.username
FROM users u
WHERE p.user_id = u.id AND p.username IS NULL;

-- 如果只有 username，没有 user_id，但能对上 users.username，用它补 user_id  
UPDATE posts p
SET user_id = u.id
FROM users u
WHERE p.username = u.username AND p.user_id IS NULL;

-- === 视图 ===
CREATE OR REPLACE VIEW posts_view AS
SELECT
  p.id,
  p.content,
  p.created_at,
  jsonb_build_object('username', u.username) AS "user",
  CASE WHEN f.id IS NOT NULL THEN jsonb_build_object('id', f.id, 'filename', f.filename, 'mime', f.mime, 'size', f.size) END AS "file"
FROM posts p
JOIN users u ON u.id = p.user_id
LEFT JOIN files f ON f.id = p.file_id
ORDER BY p.created_at DESC;

CREATE OR REPLACE VIEW user_files_view AS
SELECT f.id, f.filename, f.mime, f.size, f.created_at, u.username
FROM files f JOIN users u ON u.id = f.user_id
ORDER BY f.created_at DESC;

CREATE OR REPLACE VIEW follows_view AS
SELECT uf.username AS follower, ut.username AS following, fo.created_at
FROM follows fo
JOIN users uf ON uf.id = fo.follower_id
JOIN users ut ON ut.id = fo.following_id;
