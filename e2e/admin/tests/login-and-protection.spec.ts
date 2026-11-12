import { library } from "../../shared/library.cjs";

import { expect, test } from "./fixtures";

test.use({ storageState: { cookies: [], origins: [] } });

test("logs in with both pins", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Otaku Corner Admin")).toBeVisible();
  await page.locator("input").first().fill("135790");
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.getByText("Input progress: 2 of 2")).toBeVisible();
  await page.locator("input").first().fill("246801");
  await page.getByRole("button", { name: "Submit" }).click();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect(page.getByText("Login successful")).toBeVisible();
});

test("logged-out media library does not show the library", async ({ page }) => {
  await page.goto("/media-list");
  await expect(
    page.getByRole("heading", { name: "Unauthorized Access" })
  ).toBeVisible();
  await expect(page.getByText(library.anime.title)).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Media Library" })).toHaveCount(
    0
  );
});

test.describe("narrow login", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("shows the login screen", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Otaku Corner Admin")).toBeVisible();
    await expect(page.getByRole("button", { name: "Next" })).toBeVisible();
  });
});
