import { expect, test } from "./fixtures";

test("shows image vault models, categories, and the list", async ({ page }) => {
  await page.goto("/image-vault");
  await expect(page.getByRole("heading", { name: "Image Vault" })).toBeVisible();
  await expect(page.getByText("No images found")).toBeVisible();

  await page.getByRole("button", { name: "Manage image vault" }).click();
  await page.getByRole("menuitem", { name: "Models" }).click();
  const models = page.getByRole("dialog", { name: "Generation Models" });
  await expect(
    models.getByRole("heading", { name: "Generation Models" })
  ).toBeVisible();
  await models.getByRole("button", { name: "Close" }).click();
  await expect(models).toBeHidden();

  await page.getByRole("button", { name: "Manage image vault" }).click();
  await page.getByRole("menuitem", { name: "Categories" }).click();
  await expect(
    page.getByRole("dialog", { name: "Categories" }).getByRole("heading", {
      name: "Categories"
    })
  ).toBeVisible();
});
