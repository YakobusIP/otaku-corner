import { library } from "../../shared/library.cjs";

import { expect, test } from "./fixtures";

test("shows home counts and links for the seeded library", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Track My/ })
  ).toBeVisible();

  const animeCount = page
    .locator("div.rounded-lg")
    .filter({ hasText: "Anime Watched" });
  const mangaCount = page
    .locator("div.rounded-lg")
    .filter({ hasText: "Manga Read" });
  const lightNovelCount = page
    .locator("div.rounded-lg")
    .filter({ hasText: "Light Novels Read" });

  await expect(animeCount.getByText("1", { exact: true })).toBeVisible();
  await expect(mangaCount.getByText("1", { exact: true })).toBeVisible();
  await expect(lightNovelCount.getByText("1", { exact: true })).toBeVisible();

  await expect(page.getByRole("link", { name: "Anime", exact: true }).first()).toHaveAttribute(
    "href",
    "/anime"
  );
  await expect(page.getByRole("link", { name: "Manga", exact: true }).first()).toHaveAttribute(
    "href",
    "/manga"
  );
  await expect(
    page.getByRole("link", { name: "Light Novels", exact: true }).first()
  ).toHaveAttribute("href", "/light-novel");
});
