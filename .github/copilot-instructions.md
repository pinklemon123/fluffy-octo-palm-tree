# Forum Project - AI Coding Guidelines (MongoDB Atlas) / 论坛项目AI协作指南（MongoDB版）

> EN / 中文双语，保持精炼，供智能代理快速理解当前架构（已从 Supabase 迁移到 MongoDB Atlas）。

## 1. Architecture 架构
EN: React SPA frontend + (planned) Node/Express server using MongoDB Atlas. No Supabase anymore. Data flows: React components -> internal API layer (to be migrated) -> REST endpoints -> MongoDB collections.
中文：前端为 React 单页应用；后端需新增 Node/Express 服务，连接 MongoDB Atlas。原有 Supabase 相关调用将逐步替换为调用自建 REST API。暂未引入实时推送服务（可后续用 WebSocket / Change Streams）。

## 2. Data Model 数据模型（Mongo Collections 建议）
users: { _id, username(唯一), password(需哈希), avatarUrl, bio }
messages: { _id, userId(ref users._id), content, createdAt }
follows: { _id, followerId, followingId, createdAt }
说明：原 SQL 结构位于 `backend/schema/*.sql` 仅作参考；新建集合时保持字段语义一致。时间字段使用 ISODate。

## 3. Environment Variables 环境变量
MONGODB_URI=MongoDB Atlas 连接串（包含用户名密码，不要写入源码）
MONGODB_DB_NAME=数据库名（如 forum）
前端仍保留旧的 `REACT_APP_SUPABASE_*` 可删除；迁移过程中可并存直到全部替换。

## 4. Backend Service 后端服务（待补充）
在 `backend/` 下新增 `server.js` 或 `src/` 结构：
1. 连接：使用官方驱动 `mongodb` 或 Mongoose。
2. 提供路由：`/api/auth/register` `/api/auth/login` `/api/messages` `/api/upload` `/api/follow`。
3. 统一响应格式：{ success: boolean, data?, error? }（沿用现前端约定）。
4. 错误处理：集中中间件记录并返回 `error.message`。

Minimal connection example / 最小连接示例：
```js
// backend/db.js
const { MongoClient } = require('mongodb');
const client = new MongoClient(process.env.MONGODB_URI, { serverApi: { version: '1', strict: true } });
async function init() { if(!client.topology?.isConnected()) await client.connect(); return client.db(process.env.MONGODB_DB_NAME); }
module.exports = { init };
```

## 5. Frontend Migration 前端迁移要点
当前文件：`frontend/src/services/api.js` 仍使用 Supabase。迁移步骤：
Step A: 新建 `frontend/src/services/http.js` 封装 `fetch('/api/...')`。
Step B: 将 `registerUser/loginUser/sendMessage/fetchMessages` 改为调用后端 REST。
Step C: 去除 `@supabase/supabase-js` 依赖与相关 realtime 订阅。
Step D: 使用后端返回的 `createdAt` 字段（ISO 字符串）在前端格式化。

## 6. File Upload 文件上传
之前使用 Supabase Storage。MongoDB Atlas 不提供对象存储：
方案建议：
1. 短期：保留前端组件逻辑，后端使用本地磁盘或 Vercel/Edge 不适合写入时改用第三方（如 AWS S3）。
2. 返回结构仍为：{ success, url }。
3. 如果仅演示 HTML `.txt/.html` 内容，可直接存入 `files` 集合：{ _id, filename, mime, content(Text), uploadedAt }。

## 7. Realtime 实时功能
原 Supabase realtime 失效；临时策略：轮询 `GET /api/messages?since=...`。
后续可升级：
- WebSocket 推送新消息
- MongoDB Change Streams（需使用 Replica Set，Atlas 默认支持）

## 8. Security / 安全
- 永远不要在仓库写死密码或完整连接串。
- 添加密码哈希（bcrypt）取代当前明文逻辑。
- 校验上传文件类型与大小（前端 + 后端双层）。

## 9. Coding Conventions 编码约定
- 保留统一返回体 `{ success, data?, error? }`。
- 集中化数据库访问：创建 `repositories/`：`userRepo.js`, `messageRepo.js`。
- 日期统一使用 `new Date()` 存储，再在前端 `toLocaleString()` 渲染。
- 错误：后端抛出标准 `Error`，中间件转换为 `{ success:false, error: msg }`。

## 10. Deployment 部署
Vercel 前端保持不变；新增后端需：
- 通过 Vercel Serverless Functions (`api/` 目录) 或分离到独立服务（Railway/Render）。
- 设置 `MONGODB_URI` 与 `MONGODB_DB_NAME` 环境变量。

## 11. Migration Checklist 迁移核对
[ ] 移除 Supabase 依赖与环境变量
[ ] 添加 Mongo 连接模块
[ ] 替换注册/登录逻辑（自建用户集合 + token/会话）
[ ] 替换消息 CRUD 调用
[ ] 重新设计文件上传通道
[ ] 增加密码哈希与基础验证

## 12. When AI Adds New Code 智能代理新增代码注意
EN: Prefer incremental migration—do not rewrite frontend completely at once. Keep API response shape stable. Always read existing `api.js` before altering.
中文：遵循“渐进替换”策略，先封装新 HTTP 层，再逐个函数迁移，确保界面可逐步验证；保持返回 JSON 格式不破坏现有调用链。

---
请确认：是否需要我立即创建后端初始 `server.js` + 路由示例？如果需要，继续说明。/ Let me know if you want initial backend scaffolding added next.