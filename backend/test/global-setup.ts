import { execFileSync } from "node:child_process";
import path from "node:path";

import "./set-test-env";

export default function globalSetup(): void {
  execFileSync("pnpm", ["exec", "prisma", "migrate", "deploy"], {
    cwd: path.join(__dirname, ".."),
    env: process.env,
    stdio: "inherit"
  });
}
