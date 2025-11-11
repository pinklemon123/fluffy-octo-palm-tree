# FreeChat Forum - AI Coding Guidelines (Neon Postgres)

> 快速说明当前架构：静态 HTML 前端 + Vercel Serverless Functions + Neon PostgreSQL。

## 1. Architecture 架构
- 前端：`public/` 目录下的静态页面（HTML/JS/CSS）。
- 后端：`api/` 中的 Vercel Serverless Functions，使用 `pg` 连接 Neon。
- 鉴权：JWT（`JWT_SECRET`）。所有需要用户身份的请求都通过 `Authorization: Bearer <token>`。

## 2. Database 数据库
- Neon 连接串写入 `DATABASE_URL`，函数通过连接池复用。
- Schema 位于 `db/schema.sql`：`users`、`posts`、`files`、`follows` 表。
- 所有时间字段均使用 `timestamptz`，JSON 返回时直接由 `res.json` 序列化。

## 3. Coding Conventions 编码约定
- 统一返回格式：`{ ok: boolean, data?, error?, ... }`。
- 使用 `require('../_lib/db').query` 执行 SQL，严禁在函数内新建连接。
- 需要登录的函数使用 `require('../_lib/auth').requireUser(req)` 获取 `{ id, username }`。
- 仅保留 CommonJS（`module.exports`），避免 ESM/CJS 混用。

## 4. Frontend 前端脚本
- JS 写在每个 HTML 底部 `<script>` 内，直接调用 `/api/...`。
- 不再使用 Supabase 或 Mongo 相关代码。
- 页面需要保持语义化结构，样式集中在 `public/styles.css`。

## 5. Deployment 部署
- Vercel `vercel.json` 已配置：`/api/*` 指向 Serverless，其他请求返回 `public` 下静态文件。
- 部署前确保环境变量：`DATABASE_URL`、`JWT_SECRET`。

## 6. When AI Adds New Code 新增代码注意
- 若新增接口，请在 README 中补充说明（简洁）。
- 避免引入重型依赖；如需第三方库，请写入根目录 `package.json`。
- 变更数据库 schema 需同步更新 `db/schema.sql` 与迁移说明。

> 目标：代码清爽、部署无惊喜，确保用户在 Neon + Vercel 上可以直接跑起来。
