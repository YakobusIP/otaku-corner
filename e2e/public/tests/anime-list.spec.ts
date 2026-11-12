import { animePath, library } from "../../shared/library.cjs";

import { expect, test } from "./fixtures";

const searchKeys = (url: string) => [...new URL(url).searchParams.keys()];

test("shows the seeded anime and keeps only q and status in the URL", async ({
  page
}) => {
  await page.goto("/anime");
  await expect(
    page.getByRole("heading", { name: "Anime Watchlist" })
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: library.anime.title })
  ).toBeVisible();

  const search = page.getByPlaceholder("Search anime...");
  await search.fill("Playwright Anime");
  await page.waitForTimeout(250);
  expect(new URL(page.url()).searchParams.get("q")).toBeNull();
  await expect
    .poll(() => new URL(page.url()).searchParams.get("q"), { timeout: 4_000 })
    .toBe("Playwright Anime");
  expect(searchKeys(page.url()).every((key) => key === "q" || key === "status")).toBe(
    true
  );

  await search.fill("");
  await expect
    .poll(() => new URL(page.url()).searchParams.get("q"), { timeout: 700 })
    .toBeNull();

  await page.getByRole("button", { name: /^Completed/ }).click();
  await expect
    .poll(() => new URL(page.url()).searchParams.get("status"))
    .toBe("COMPLETED");
  expect(searchKeys(page.url())).toEqual(["status"]);

  await page.getByRole("button", { name: "Sort by Title" }).click();
  await page.getByRole("menuitem", { name: /MAL Score/ }).click();
  await expect
    .poll(() => searchKeys(page.url()))
    .toEqual(["status"]);

  await page.getByRole("button", { name: "Filters" }).click();
  await page
    .getByRole("combobox")
    .filter({ hasText: "Filter by: Genre" })
    .click();
  await page.getByRole("option", { name: "Playwright Genre" }).click();
  await page.keyboard.press("Escape");
  await expect(page.getByText("Genre: Playwright Genre")).toBeVisible();
  expect(searchKeys(page.url())).toEqual(["status"]);
  await expect(page.getByRole("link", { name: library.anime.title })).toBeVisible();
});

test.describe("mobile list", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("shows the seeded anime title", async ({ page }) => {
    await page.goto(animePath);
    await page.goto("/anime");
    await expect(page.getByText(library.anime.title)).toBeVisible();
  });
});
