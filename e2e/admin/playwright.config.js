const path = require("node:path");

const { defineConfig, devices } = require("@playwright/test");

const { adminBaseUrl, adminEnv, backendEnv } = require("../shared/env.cjs");

const repoRoot = path.resolve(__dirname, "../..");
const authFile = path.join(__dirname, ".auth/admin.json");

module.exports = defineConfig({
  testDir: "tests",
  globalSetup: "./global-setup.js",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  forbidOnly: !!process.env.CI,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  reporter: "list",
  use: {
    baseURL: adminBaseUrl,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "off"
  },
  projects: [
    {
      name: "seed",
      testMatch: /auth-seed\.setup\.ts/
    },
    {
      name: "desktop",
      dependencies: ["seed"],
      testIgnore: /auth-seed\.setup\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 720 },
        storageState: authFile
      }
    }
  ],
  webServer: [
    {
      command: "node e2e/shared/start-backend.cjs",
      cwd: repoRoot,
      url: "http://127.0.0.1:5000/api/docs",
      timeout: 240_000,
      reuseExistingServer: false,
      env: {
        ...process.env,
        ...backendEnv
      }
    },
    {
      command: "pnpm exec vite --host 127.0.0.1 --port 5173",
      cwd: path.join(repoRoot, "admin-app"),
      url: adminBaseUrl,
      timeout: 240_000,
      reuseExistingServer: false,
      env: {
        ...process.env,
        ...adminEnv
      }
    }
  ]
});
