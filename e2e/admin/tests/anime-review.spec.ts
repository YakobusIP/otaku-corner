import { animePath } from "../../shared/library.cjs";

import { expect, test } from "./fixtures";

const reviewText = "Playwright review text 921001";

test("saves anime review text and keeps it after reload", async ({ page }) => {
  await page.goto(animePath);
  const editor = page.locator(".w-md-editor textarea");
  await expect(editor).toBeVisible();
  await editor.fill(reviewText);
  await page.getByRole("button", { name: "Submit review" }).click();
  await expect(page.getByText(/Saved at/)).toBeVisible();

  await page.reload();
  await expect(page.locator(".w-md-editor textarea")).toHaveValue(
    new RegExp(reviewText)
  );
});
