import { library, lightNovelPath } from "../../shared/library.cjs";

import { expect, test } from "./fixtures";

test("shows the light novel title and synopsis", async ({ page }) => {
  await page.goto(lightNovelPath);
  await expect(
    page.getByRole("heading", { name: library.lightNovel.title })
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Synopsis" })).toBeVisible();
  await expect(page.getByText(library.lightNovel.synopsis)).toBeVisible();
});
