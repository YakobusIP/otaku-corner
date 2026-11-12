import { library } from "../../shared/library.cjs";

import { expect, test } from "./fixtures";

const searchKeys = (url: string) => [...new URL(url).searchParams.keys()];

test("shows the seeded manga and searches with q only", async ({ page }) => {
  await page.goto("/manga");
  await expect(
    page.getByRole("heading", { name: "Manga Collection" })
  ).toBeVisible();
  await expect(page.getByRole("link", { name: library.manga.title })).toBeVisible();

  await page.getByPlaceholder("Search manga...").fill("Playwright Manga");
  await expect
    .poll(() => new URL(page.url()).searchParams.get("q"), { timeout: 4_000 })
    .toBe("Playwright Manga");
  expect(
    searchKeys(page.url()).every((key) => key === "q" || key === "status")
  ).toBe(true);
  await expect(page.getByRole("link", { name: library.manga.title })).toBeVisible();
});
