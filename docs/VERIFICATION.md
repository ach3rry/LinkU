# LinkU 本地验证清单

阶段交付前先确认工作区干净或只包含本次预期变更：

```bash
git status --short --branch
```

## 必跑命令

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm smoke
pnpm --filter @linku/api build
pnpm --filter @linku/web build
```

命令含义：

- `pnpm lint`：检查 apps 和 packages 的 ESLint 规则。
- `pnpm typecheck`：检查 TypeScript 类型，Web 会先生成 Next.js 类型。
- `pnpm test`：运行 API 最小单测，覆盖安全规则和会员策略。
- `pnpm smoke`：检查阶段 9 交付文档、关键脚本、环境变量示例和 seed 数据存在。
- `pnpm --filter @linku/api build`：验证 NestJS API 可构建。
- `pnpm --filter @linku/web build`：验证 Next.js Web 可构建。

## 数据库变更验证

涉及 Prisma schema、seed 或数据库访问逻辑时额外运行：

```bash
pnpm db:generate
pnpm db:push
pnpm db:seed
```

运行后建议本地访问：

- `GET http://localhost:4000/health`
- Web 首页：http://localhost:3000
- 滑卡页：http://localhost:3000/swipe
- 管理后台：http://localhost:3000/admin

## 手动 smoke 路径

1. mock 登录一个普通用户，确认能进入核心页面。
2. 进入专区选择页，确认三大专区文案正常展示。
3. 进入滑卡页，确认推荐卡片、左滑、右滑和匹配弹窗没有明显报错。
4. 进入个人中心，确认会员 mock 和联系申请入口可见。
5. 进入管理后台，确认举报与审核示例可见。

## 提交前检查

- `.env`、真实 API Key、数据库密码、真实 `JWT_SECRET` 没有出现在 `git diff`。
- README、docs 和 `docs/TASKS.md` 已同步阶段状态。
- 通过 Conventional Commits 提交，并在阶段完成后 push 到 GitHub。

## CI 验证

GitHub Actions 会在 push 到 `main` 和 pull request 时运行同一组核心命令：

```bash
pnpm db:generate
pnpm lint
pnpm typecheck
pnpm test
pnpm smoke
pnpm --filter @linku/api build
pnpm --filter @linku/web build
```
