import { library, lightNovelPath } from "../../shared/library.cjs";

import { expect, test } from "./fixtures";

test("saves light novel volume progress", async ({ page }) => {
  await page.goto(lightNovelPath);
  await expect(
    page.getByRole("heading", { name: library.lightNovel.title })
  ).toBeVisible();

  const volumeProgress = page
    .locator("div")
    .filter({ has: page.getByText("Volume progress", { exact: true }) })
    .last();
  await volumeProgress.getByRole("button").click();

  const dialog = page.getByRole("dialog", { includeHidden: true }).filter({
    has: page.getByRole("heading", {
      name: `${library.lightNovel.title} Volume Progress`,
      includeHidden: true
    })
  });
  await expect(
    dialog.getByRole("heading", {
      name: `${library.lightNovel.title} Volume Progress`
    })
  ).toBeVisible();

  await dialog.getByRole("button", { name: "1", exact: true }).click();
  await expect(page.getByText("Month consumed")).toBeVisible();
  await page.getByRole("gridcell", { name: "Jan" }).click();
  // The month popover is modal, so the volume dialog is hidden from the
  // accessibility tree until the popover closes. Save still accepts the click.
  await dialog
    .getByRole("button", { name: "Save changes", includeHidden: true })
    .click({ force: true });
  await expect(page.getByText("Volume progress updated successfully")).toBeVisible();
  await expect(
    dialog.getByRole("button", {
      name: "1",
      exact: true,
      includeHidden: true
    })
  ).toHaveClass(/bg-green-700/);
});
