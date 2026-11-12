import { expect, test } from "./fixtures";

const tenraiTitle = "Playwright Tenrai Anime 929001";

test("add anime dialog uses an intercepted Tenrai search", async ({ page }) => {
  await page.route("**/api/tenrai/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: [
          {
            mal_id: 929001,
            title: tenraiTitle,
            title_english: tenraiTitle,
            title_japanese: "Playwright Tenrai JP",
            type: "Movie",
            year: 2020,
            images: {
              jpg: {
                image_url: "https://e2e-r2-public.example.com/poster.jpg",
                small_image_url: "https://e2e-r2-public.example.com/poster.jpg",
                large_image_url: "https://e2e-r2-public.example.com/poster.jpg"
              },
              webp: {
                image_url: "https://e2e-r2-public.example.com/poster.jpg",
                small_image_url: "https://e2e-r2-public.example.com/poster.jpg",
                large_image_url: "https://e2e-r2-public.example.com/poster.jpg"
              }
            }
          }
        ],
        pagination: {
          last_visible_page: 1,
          has_next_page: false,
          items: { count: 1, total: 1, per_page: 10 }
        }
      })
    });
  });

  await page.goto("/media-list");
  await page.getByRole("button", { name: "Manage media" }).click();
  await page.getByRole("menuitem", { name: "Add Anime" }).click();

  const dialog = page.getByRole("dialog", { name: "Add new anime entry" });
  await expect(dialog).toBeVisible();
  await dialog.getByPlaceholder("Search anime by title...").fill("Naruto");
  await expect(dialog.getByText(tenraiTitle)).toBeVisible();
  await expect(
    dialog.getByRole("button", { name: `Add ${tenraiTitle}` })
  ).toBeVisible();
});
