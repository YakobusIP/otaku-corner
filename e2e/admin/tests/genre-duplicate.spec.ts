import { expect, test } from "./fixtures";

const genreName = "Playwright Extra Genre";

test("creates a genre and shows the duplicate error", async ({ page }) => {
  await page.goto("/entity-management");
  await expect(
    page.getByRole("heading", { name: "Entity Management" })
  ).toBeVisible();
  await page.getByRole("tab", { name: "Genres" }).click();

  const addGenre = async () => {
    await page.getByRole("button", { name: "Add Genre" }).click();
    const dialog = page.getByRole("dialog", { name: "Add Genre" });
    await dialog.getByPlaceholder("Genre name").fill(genreName);
    await dialog.getByRole("button", { name: "Add", exact: true }).click();
  };

  await addGenre();
  await expect(page.getByText("Genre added successfully")).toBeVisible();

  await addGenre();
  await expect(page.getByText("Resource already exists")).toBeVisible();
});
