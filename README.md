# Forum Project (Vercel + Neon + JWT + Vercel Blob)

- 静态前端在 `/public`
- 无服务器后端在 `/api`
- 数据库初始化脚本 `schema.sql`

## 环境变量（Vercel Settings → Environment Variables）
- `DATABASE_URL`：Neon 连接串（必填）
- `JWT_SECRET`：随机长字符串（必填；测试可用 `dev`）
- `BLOB_READ_WRITE_TOKEN`：Vercel Blob 的 RW token（可选，用于文件上传）

## 自测
- `GET /api/db-check`
- `POST /api/users/register` → `POST /api/users/login` → `GET /api/whoami`
- `POST /api/files/upload`（表单 file）→ `POST /api/posts/create` → `GET /api/posts/list`
