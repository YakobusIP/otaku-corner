import { animePath, library } from "../../shared/library.cjs";

import { expect, test } from "./fixtures";

test("shows the anime title and synopsis", async ({ page }) => {
  await page.goto(animePath);
  await expect(
    page.getByRole("heading", { name: library.anime.title })
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Synopsis" })).toBeVisible();
  await expect(page.getByText(library.anime.synopsis)).toBeVisible();
});

test.describe("mobile detail", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("shows the anime title", async ({ page }) => {
    await page.goto(animePath);
    await expect(
      page.getByRole("heading", { name: library.anime.title })
    ).toBeVisible();
  });
});
