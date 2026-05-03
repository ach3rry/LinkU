# LinkU 开发会话记录

## 最近完成的工作（2026-05-03）

### Supabase 云数据库初始化
- Prisma schema 推送到 Supabase Postgres（project ref: nxwfumeauwzajokvnfxx）
- 连接串：`aws-1-ap-southeast-1.pooler.supabase.com:5432`（Session Pooler，IPv4）
- 三大专区数据已初始化（TUTORING / BUDDY / PREMIUM）
- 所有表的 id、createdAt、updatedAt 已加数据库层 DEFAULT（Prisma 的 @default 只在 Prisma Client 生效，Supabase 直连需要数据库 DEFAULT）
- RLS 策略已配置：User / Zone / Card / Swipe / Match / ContactRequest / Block / Report

### Netlify 部署
- 线上地址：https://linkuni.netlify.app/
- `netlify.toml` 已配置（构建命令、Next.js 插件）
- 环境变量需要 3 个 NEXT_PUBLIC_ 变量 + NODE_VERSION=20
- **重要**：粘贴 NEXT_PUBLIC_SUPABASE_ANON_KEY 时不能有换行或空格，否则 JWT 截断导致 401

### Supabase 直连模式
- `NEXT_PUBLIC_LINKU_DATA_MODE=supabase` 时前端直接操作 Supabase
- 已实现的直连功能：注册/登录、建卡（直接 ACTIVE 无需审核）、推荐、滑卡、双向匹配、联系申请、举报、拉黑
- 新增 `/api/auth/[...path]` 服务端代理路由，浏览器直连 Supabase 失败时自动回退
- auth-panel 支持直连 + 代理双重策略

### 关键 bug 修复
- 数据库层 DEFAULT 补齐（id、createdAt、updatedAt）
- 建卡状态从 PENDING 改为 ACTIVE（MVP 免审核）
- Profile 页 Supabase 直连
- 滑卡页三种数据模式（supabase / api / mock）+ 专区切换

### 已知问题
- Supabase Email 确认默认开启，用户注册后需确认邮箱才能登录
- 建议在 Supabase Dashboard → Authentication → Providers → Email 关掉 Confirm email（MVP 阶段）
- `linkutest2026@gmail.com` 和 `1595486059h@gmail.com` 是测试账号

## 下一步开发任务（按优先级）

### P0：验证 MVP 闭环
- 用两个真实账号走通：注册 → 建卡 → 滑卡 → 匹配 → 联系申请
- 检查移动端适配

### P1：体验优化
- 空状态/错误状态/加载状态补齐（建卡页、滑卡页、Profile 页）
- 用户资料编辑页（学校、城市、年级、专业）
- 关掉 Supabase 邮件确认（Dashboard 操作）

### P2：去 mock
- Admin 页面 Supabase 直连
- 会员状态从占位切换为真实权益
- 学长学姐专区 MVP 规则定稿

### P3：生产准备
- Prisma migrations（从 db push 切换）
- CORS / Rate limit / 安全响应头
- 自定义域名
- 备份方案
