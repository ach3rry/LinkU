import { readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { spawnSync } from "node:child_process";

const srcDir = join(process.cwd(), "src");

function collectTestFiles(dir) {
  return readdirSync(dir)
    .flatMap((name) => {
      const path = join(dir, name);
      const stat = statSync(path);

      if (stat.isDirectory()) {
        return collectTestFiles(path);
      }

      return name.endsWith(".test.ts") ? [path] : [];
    })
    .sort();
}

const testFiles = collectTestFiles(srcDir);

if (testFiles.length === 0) {
  console.error("No API test files found.");
  process.exit(1);
}

const result = spawnSync(
  "tsx",
  ["--test", ...testFiles.map((file) => relative(process.cwd(), file))],
  {
    stdio: "inherit",
    shell: process.platform === "win32",
  },
);

process.exit(result.status ?? 1);
