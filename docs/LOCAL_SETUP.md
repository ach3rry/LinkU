# LinkU 本地启动说明

本文档用于从干净仓库启动 LinkU MVP。命令默认在仓库根目录 `D:\LinkU` 执行。

## 前置要求

- Node.js 20+。
- pnpm 10+，仓库当前声明版本为 `pnpm@10.33.2`。
- PostgreSQL，本地或远程实例均可。
- 可选：OpenAI-compatible AI 服务。未配置 AI Key 时，系统会使用 fallback 逻辑。

## 环境变量

复制环境变量示例：

```powershell
Copy-Item .env.example .env
```

本地至少需要填写：

```env
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/linku
JWT_SECRET=请换成本地开发密钥
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

AI 相关变量可先留空：

```env
AI_PROVIDER=openai-compatible
OPENAI_COMPATIBLE_BASE_URL=
OPENAI_COMPATIBLE_API_KEY=
OPENAI_COMPATIBLE_MODEL=
```

不要提交真实 `.env`、API Key、数据库密码或 `JWT_SECRET`。

## 安装依赖

```bash
pnpm install
```

## 初始化数据库

MVP 阶段使用 Prisma `db push` 同步 schema：

```bash
pnpm db:generate
pnpm db:push
pnpm db:seed
```

`pnpm db:seed` 会清空并重建演示数据，适合本地重置。不要对生产数据库直接运行 seed。

## 启动服务

同时启动 Web 和 API：

```bash
pnpm dev
```

或分别启动：

```bash
pnpm --filter @linku/api dev
pnpm --filter @linku/web dev
```

默认地址：

- Web：http://localhost:3000
- API：http://localhost:4000
- API 健康检查：http://localhost:4000/health

## 常用演示数据

seed 数据包含：

- 三大专区：家教专区、搭子专区、学长学姐专区。
- 用户：`admin@linku.local`、`student@linku.local`、`tutor@linku.local`、`buddy@linku.local`、`senior@linku.local`。
- 卡片：家教需求、家教提供、自习晚饭搭子、Premium Match 简历修改。
- 闭环数据：双向匹配、联系申请、举报审核示例、会员 mock。

mock 登录接口可以使用这些邮箱，也可以输入新的昵称和学校生成本地演示用户。
