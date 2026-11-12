const { execFileSync, spawn } = require("node:child_process");
const path = require("node:path");

const { applyBackendEnv } = require("./env.cjs");
const { resetE2eDatabase } = require("./reset-database.cjs");

const repoRoot = path.resolve(__dirname, "../..");
const backendDir = path.join(repoRoot, "backend");

const main = async () => {
  applyBackendEnv();
  await resetE2eDatabase();
  execFileSync("pnpm", ["exec", "prisma", "generate", "--sql"], {
    cwd: backendDir,
    env: process.env,
    stdio: "inherit"
  });

  const child = spawn("pnpm", ["exec", "nest", "start"], {
    cwd: path.join(repoRoot, "backend"),
    env: process.env,
    stdio: "inherit"
  });

  const forward = (signal) => {
    child.kill(signal);
  };

  process.on("SIGTERM", () => forward("SIGTERM"));
  process.on("SIGINT", () => forward("SIGINT"));

  child.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }
    process.exit(code ?? 1);
  });
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
