import { library, mangaPath } from "../../shared/library.cjs";

import { expect, test } from "./fixtures";

test("shows the manga title and synopsis", async ({ page }) => {
  await page.goto(mangaPath);
  await expect(
    page.getByRole("heading", { name: library.manga.title })
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Synopsis" })).toBeVisible();
  await expect(page.getByText(library.manga.synopsis)).toBeVisible();
});
