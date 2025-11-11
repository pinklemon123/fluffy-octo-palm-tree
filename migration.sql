-- 为现有的 files 表添加 data 字段，并将 url 字段改为可选
-- 运行此 SQL 来更新现有数据库结构

-- 添加 data 字段用于存储 base64 数据
ALTER TABLE files ADD COLUMN IF NOT EXISTS data text;

-- 将 url 字段改为可选（如果之前是 NOT NULL）
ALTER TABLE files ALTER COLUMN url DROP NOT NULL;

-- 更新视图以包含 data 字段
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