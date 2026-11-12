import { test as base } from "@playwright/test";

export const test = base.extend({
  page: async ({ page }, use) => {
    await page.route(/https?:\/\/api\.tenrai\.org\//, (route) => route.abort());
    await page.route(/https?:\/\/api\.cloudflare\.com\//, (route) =>
      route.abort()
    );
    await page.route(/https?:\/\/127\.0\.0\.1:9\//, (route) => route.abort());
    await use(page);
  }
});

export { expect } from "@playwright/test";
