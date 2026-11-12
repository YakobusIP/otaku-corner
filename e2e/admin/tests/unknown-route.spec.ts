import { expect, test } from "./fixtures";

test("unknown routes show the not-found page", async ({ page }) => {
  await page.goto("/this-route-does-not-exist");
  await expect(page.getByText("404", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Page not found" })
  ).toBeVisible();

  await page.goto("/404");
  await expect(page.getByText("404", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Page not found" })
  ).toBeVisible();
});
