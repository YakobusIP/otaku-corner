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

  const dialog = page.getByRole("dialog").filter({
    has: page.getByRole("heading", {
      name: `${library.lightNovel.title} Volume Progress`
    })
  });
  await expect(
    dialog.getByRole("heading", {
      name: `${library.lightNovel.title} Volume Progress`
    })
  ).toBeVisible();

  await dialog.getByRole("button", { name: "1", exact: true }).click();
  await page.getByRole("gridcell", { name: "Jan" }).click();
  await page.keyboard.press("Escape");
  await dialog.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText("Volume progress updated successfully")).toBeVisible();
  await expect(
    dialog.getByRole("button", { name: "1", exact: true })
  ).toHaveClass(/bg-green-700/);
});
