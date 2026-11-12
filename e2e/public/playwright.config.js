const path = require("node:path");

const { defineConfig, devices } = require("@playwright/test");

const { backendEnv, publicBaseUrl, publicEnv } = require("../shared/env.cjs");

const repoRoot = path.resolve(__dirname, "../..");

const serverEnv = {
  ...process.env,
  ...backendEnv
};

module.exports = defineConfig({
  testDir: "tests",
  globalSetup: "./global-setup.js",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  forbidOnly: !!process.env.CI,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: "list",
  use: {
    baseURL: publicBaseUrl,
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
        viewport: { width: 1280, height: 720 }
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
      env: serverEnv
    },
    {
      command: "pnpm exec next dev --hostname 127.0.0.1 --port 3000",
      cwd: path.join(repoRoot, "public-app"),
      url: publicBaseUrl,
      timeout: 240_000,
      reuseExistingServer: false,
      env: {
        ...process.env,
        ...publicEnv
      }
    }
  ]
});
