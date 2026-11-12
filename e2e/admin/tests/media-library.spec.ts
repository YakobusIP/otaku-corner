import { library } from "../../shared/library.cjs";

import { expect, test } from "./fixtures";

test("search and media type narrow the seeded library", async ({ page }) => {
  await page.goto("/media-list");
  await expect(
    page.getByRole("heading", { name: "Media Library" })
  ).toBeVisible();
  await expect(page.getByText(library.anime.title)).toBeVisible();
  await expect(page.getByText(library.manga.title)).toBeVisible();
  await expect(page.getByText(library.lightNovel.title)).toBeVisible();

  await page
    .getByPlaceholder("Search title or synonyms...")
    .fill("Playwright Manga");
  await expect(page.getByText(library.manga.title)).toBeVisible();
  await expect(page.getByText(library.anime.title)).toHaveCount(0);
  await expect(page.getByText(library.lightNovel.title)).toHaveCount(0);

  await page.getByPlaceholder("Search title or synonyms...").fill("");
  await page.getByRole("tab", { name: "Anime", exact: true }).click();
  await expect(page.getByText(library.anime.title)).toBeVisible();
  await expect(page.getByText(library.manga.title)).toHaveCount(0);
  await expect(page.getByText(library.lightNovel.title)).toHaveCount(0);

  await page.getByRole("tab", { name: "Light Novel", exact: true }).click();
  await expect(page.getByText(library.lightNovel.title)).toBeVisible();
  await expect(page.getByText(library.anime.title)).toHaveCount(0);
});

test.describe("narrow library", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("shows a seeded title", async ({ page }) => {
    await page.goto("/media-list");
    await expect(
      page.getByRole("heading", { name: "Media Library" })
    ).toBeVisible();
    await expect(page.getByText(library.anime.title)).toBeVisible();
  });
});
