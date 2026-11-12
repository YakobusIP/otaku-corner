import { expect, test } from "./fixtures";

test("persists a valid catalog interval and rejects an invalid one", async ({
  page
}) => {
  await page.goto("/settings");
  await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "General" })).toBeVisible();

  const enabled = page.getByRole("checkbox", { name: "Enable scheduled sync" });
  await expect(enabled).not.toBeChecked();

  const interval = page.getByLabel("Interval (days)");
  await expect(interval).toHaveValue("14");
  await interval.fill("21");

  await page.getByRole("button", { name: "Save general settings" }).click();
  await expect(page.getByText("General settings saved")).toBeVisible();

  await page.reload();
  await expect(page.getByLabel("Interval (days)")).toHaveValue("21");
  await expect(
    page.getByRole("checkbox", { name: "Enable scheduled sync" })
  ).not.toBeChecked();

  let catalogPuts = 0;
  page.on("request", (request) => {
    if (
      request.method() === "PUT" &&
      request.url().includes("media.catalog_sync")
    ) {
      catalogPuts += 1;
    }
  });

  await page.getByLabel("Interval (days)").fill("0");
  await page.getByRole("button", { name: "Save general settings" }).click();
  await page.waitForTimeout(500);
  expect(catalogPuts).toBe(0);

  await page.reload();
  await expect(page.getByLabel("Interval (days)")).toHaveValue("21");
  await expect(
    page.getByRole("checkbox", { name: "Enable scheduled sync" })
  ).not.toBeChecked();
});
