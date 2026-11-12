import { expect, test } from "./fixtures";

test("shows the notification center", async ({ page }) => {
  await page.goto("/notifications");
  await expect(
    page.getByRole("heading", { name: "Notification Center" })
  ).toBeVisible();
  await expect(
    page.getByText("Catalog sync runs and audit history")
  ).toBeVisible();

  await expect(page.getByRole("tab", { name: "Open Conflicts" })).toBeVisible();
  await expect(
    page.getByText("Open catalog sync conflicts", { exact: true })
  ).toBeVisible();
  await expect(page.getByText(/unresolved conflicts/)).toBeVisible();

  await page.getByRole("tab", { name: "Audit Log" }).click();
  await expect(page.getByRole("cell", { name: "Time", exact: true })).toBeVisible();

  await page.getByRole("tab", { name: "Sync Runs" }).click();
  await expect(
    page.getByRole("cell", { name: "Started", exact: true })
  ).toBeVisible();
});
