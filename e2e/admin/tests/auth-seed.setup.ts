import { mkdir } from "node:fs/promises";
import path from "node:path";

import { test as setup } from "@playwright/test";

import { loginAsAdmin } from "../login";

import { seedLibrary } from "../../shared/seed-library.cjs";

const authFile = path.join(process.cwd(), ".auth/admin.json");

setup("seed library and save the admin session", async ({ page }) => {
  await seedLibrary();
  await loginAsAdmin(page);
  await mkdir(path.dirname(authFile), { recursive: true });
  await page.context().storageState({ path: authFile });
});
