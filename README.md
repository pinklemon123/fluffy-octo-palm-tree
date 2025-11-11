# FreeChat Forum

一个部署在 Vercel 上的轻量社区，前端使用静态 HTML/CSS/JS，后端通过 Vercel Serverless Functions 访问 Neon PostgreSQL。

## 功能亮点
- 用户注册 / 登录，使用 JWT 保持会话
- 发表帖子、浏览最新帖子
- 关注其他用户、查看个人资料
- 上传文件并记录元数据（演示用途）

## Neon 数据库设置
1. 在 [Neon](https://neon.tech) 创建一个项目，并复制连接字符串（`postgresql://...`）。
2. 在 Neon 控制台执行 `db/schema.sql` 中的建表脚本。
3. 可选：为不同环境创建分支或角色，限制权限。

## 本地开发
1. 克隆仓库并安装依赖（需要 Node 18）：
   ```bash
   npm install
   ```
2. 新建 `.env.local`（或直接在终端导出）并设置：
   ```bash
   DATABASE_URL="postgresql://..."   # 你的 Neon 连接串
   JWT_SECRET="任意随机字符串"
   ```
3. 启动一个本地 HTTP 静态服务器，例如：
   ```bash
   npx serve public
   ```
   然后在另一个终端使用 `vercel dev` 或任何支持 Node 的方式运行 `api/` 目录下的函数。

> 小贴士：开发阶段可以使用 `psql` 连接 Neon 检查表数据，例如 `psql "$DATABASE_URL" -c 'select * from users;'`。

## 部署到 Vercel
1. 在 Vercel 创建项目，仓库指向本仓库。
2. 在 **Project Settings → Environment Variables** 中配置：
   - `DATABASE_URL`：Neon 提供的连接字符串
   - `JWT_SECRET`：任意随机字符串
3. 部署完成后，静态页面来自 `public/`，API 由 `api/` 下的 Serverless Functions 提供。

## 项目结构
```
api/           # Vercel Serverless Functions（Node 18 + PostgreSQL）
db/schema.sql  # Neon 初始化脚本
public/        # 静态前端页面与样式
vercel.json    # Vercel 路由 & 构建配置
```

## 常见问题
- **页面没有刷新样式？** 确认访问的 HTML 来自 `public/`，并且部署完成后清理浏览器缓存。
- **API 返回 500？** 检查 Vercel 项目的日志，确认 `DATABASE_URL` 正确且数据库表已初始化。
- **需要清理多余代码？** 旧的 Supabase/Mongo/Express 目录已移除，确保仅维护 `api/` + `public/`。
