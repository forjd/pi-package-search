import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

const gitDirExists = existsSync(".git");
const simpleGitHooksBin =
  process.platform === "win32"
    ? "node_modules/.bin/simple-git-hooks.cmd"
    : "node_modules/.bin/simple-git-hooks";

if (!gitDirExists) {
  console.log("[prepare] Skipping git hook setup: no .git directory found.");
  process.exit(0);
}

if (!existsSync(simpleGitHooksBin)) {
  console.log(
    "[prepare] Skipping git hook setup: simple-git-hooks is not installed in this environment.",
  );
  process.exit(0);
}

const result = spawnSync(simpleGitHooksBin, {
  stdio: "inherit",
  shell: process.platform === "win32",
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}
