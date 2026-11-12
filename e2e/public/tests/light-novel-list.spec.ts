import { library } from "../../shared/library.cjs";

import { expect, test } from "./fixtures";

const searchKeys = (url: string) => [...new URL(url).searchParams.keys()];

test("shows the seeded light novel and searches with q only", async ({
  page
}) => {
  await page.goto("/light-novel");
  await expect(
    page.getByRole("heading", { name: "Light Novel Collection" })
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: library.lightNovel.title })
  ).toBeVisible();

  await page
    .getByPlaceholder("Search light novel...")
    .fill("Playwright Light Novel");
  await expect
    .poll(() => new URL(page.url()).searchParams.get("q"), { timeout: 4_000 })
    .toBe("Playwright Light Novel");
  expect(
    searchKeys(page.url()).every((key) => key === "q" || key === "status")
  ).toBe(true);
  await expect(
    page.getByRole("link", { name: library.lightNovel.title })
  ).toBeVisible();
});
