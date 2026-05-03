import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
let checks = 0;

function read(relativePath) {
  return readFileSync(join(root, relativePath), "utf8");
}

function assert(condition, message) {
  checks += 1;

  if (!condition) {
    throw new Error(message);
  }
}

function fileExists(relativePath) {
  return existsSync(join(root, relativePath));
}

const requiredFiles = [
  ".github/workflows/ci.yml",
  "docker-compose.yml",
  "README.md",
  "docs/TASKS.md",
  "docs/LOCAL_SETUP.md",
  "docs/VERIFICATION.md",
  "docs/DEPLOYMENT.md",
  ".env.example",
  "apps/api/prisma/schema.prisma",
  "apps/api/prisma/seed.ts",
  "apps/api/src/app.controller.ts",
  "apps/api/src/app.module.test.ts",
  "apps/api/src/safety/safety.service.test.ts",
  "apps/api/src/subscriptions/subscription-policy.test.ts",
  "apps/web/src/app/page.tsx",
  "packages/shared/src/index.ts",
];

for (const file of requiredFiles) {
  assert(fileExists(file), `Missing required file: ${file}`);
}

const packageJson = JSON.parse(read("package.json"));
const requiredScripts = [
  "lint",
  "typecheck",
  "test",
  "smoke",
  "db:start",
  "db:generate",
  "db:push",
  "db:seed",
];

for (const script of requiredScripts) {
  assert(Boolean(packageJson.scripts?.[script]), `Missing package script: ${script}`);
}

const envExample = read(".env.example");
const requiredEnvKeys = [
  "DATABASE_URL",
  "JWT_SECRET",
  "AI_PROVIDER",
  "OPENAI_COMPATIBLE_BASE_URL",
  "OPENAI_COMPATIBLE_API_KEY",
  "OPENAI_COMPATIBLE_MODEL",
  "NEXT_PUBLIC_API_BASE_URL",
];

for (const key of requiredEnvKeys) {
  assert(new RegExp(`^${key}=`, "m").test(envExample), `Missing .env.example key: ${key}`);
}

for (const key of ["DATABASE_URL", "JWT_SECRET", "OPENAI_COMPATIBLE_API_KEY"]) {
  const value = envExample.match(new RegExp(`^${key}=(.*)$`, "m"))?.[1]?.trim();
  assert(!value, `.env.example should not include a real value for ${key}`);
}

const readme = read("README.md");
const readmeSections = ["## 本地启动", "## 数据库与 seed 数据", "## 本地验证", "## 部署说明"];

for (const section of readmeSections) {
  assert(readme.includes(section), `README missing section: ${section}`);
}

const verification = read("docs/VERIFICATION.md");
const requiredVerificationCommands = [
  "pnpm lint",
  "pnpm typecheck",
  "pnpm test",
  "pnpm smoke",
  "pnpm --filter @linku/api build",
  "pnpm --filter @linku/web build",
];

for (const command of requiredVerificationCommands) {
  assert(verification.includes(command), `Verification doc missing command: ${command}`);
}

const deployment = read("docs/DEPLOYMENT.md");
assert(deployment.includes("NEXT_PUBLIC_API_BASE_URL"), "Deployment doc missing web API env");
assert(
  deployment.includes("pnpm --filter @linku/api build"),
  "Deployment doc missing API build command",
);

const ci = read(".github/workflows/ci.yml");
for (const command of ["pnpm lint", "pnpm typecheck", "pnpm test", "pnpm smoke"]) {
  assert(ci.includes(command), `CI workflow missing command: ${command}`);
}
assert(
  deployment.includes("pnpm --filter @linku/web build"),
  "Deployment doc missing Web build command",
);

const seed = read("apps/api/prisma/seed.ts");
for (const expected of [
  "admin@linku.local",
  "student@linku.local",
  "tutor@linku.local",
  "buddy@linku.local",
  "senior@linku.local",
  "LinkU seed data created.",
]) {
  assert(seed.includes(expected), `Seed file missing expected fixture: ${expected}`);
}

const tasks = read("docs/TASKS.md");
for (const item of [
  "- [x] README 本地启动说明",
  "- [x] 本地验证清单",
  "- [x] seed 数据说明",
  "- [x] 基础测试",
  "- [x] 部署说明",
  "- [x] GitHub Actions CI",
  "- [x] API 最小单测",
]) {
  assert(tasks.includes(item), `TASKS missing completed item: ${item}`);
}

console.log(`[smoke] ${checks} delivery checks passed.`);
