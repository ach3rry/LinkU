# Supabase 手动 SQL

这个目录放 MVP 阶段需要在 Supabase Dashboard SQL Editor 手动执行的脚本。

推荐顺序：

1. `mvp_rls.sql`：补齐 RLS 策略，保证注册、建卡、推荐、滑卡、匹配、联系申请、举报、拉黑可以在 Supabase 直连模式下工作。
2. `demo_seed.sql`：插入演示用户和演示卡片，让新用户进入滑卡页时有内容可看。

执行前确认已经完成表结构初始化：

```bash
pnpm db:generate
pnpm db:push
```

真实密钥、数据库连接串和用户密码不要写入这些 SQL 文件。
