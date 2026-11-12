import { library, mangaPath } from "../../shared/library.cjs";

import { expect, test } from "./fixtures";

test("shows manga chapter and volume counts", async ({ page }) => {
  await page.goto(mangaPath);
  await expect(
    page.getByRole("heading", { name: library.manga.title })
  ).toBeVisible();

  const chapters = page.locator("div.rounded-xl").filter({ hasText: "Chapters" });
  await expect(chapters.getByText("24", { exact: true })).toBeVisible();

  const volumes = page.locator("div.rounded-xl").filter({ hasText: "Volumes" });
  await expect(volumes.getByText("3", { exact: true })).toBeVisible();
});
