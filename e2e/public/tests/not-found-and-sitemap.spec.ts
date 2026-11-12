import { animePath, library } from "../../shared/library.cjs";

import { expect, test } from "./fixtures";

test("rejects detail ids that are not positive integers", async ({ page }) => {
  for (const path of ["/anime/0/nope", "/anime/abc/slug", "/manga/-1/slug"]) {
    await page.goto(path);
    await expect(page.getByRole("heading", { name: "Not Found" })).toBeVisible();
  }

  await page.goto("/this-route-does-not-exist");
  await expect(page.getByRole("heading", { name: "Not Found" })).toBeVisible();
});

test("sitemap index and anime sitemap include the seeded detail path", async ({
  request
}) => {
  const index = await request.get("/sitemaps.xml");
  expect(index.status()).toBe(200);
  const indexXml = await index.text();
  expect(indexXml).toContain("sitemap-anime-0.xml");

  const animeSitemap = await request.get("/sitemap-anime-0.xml");
  expect(animeSitemap.status()).toBe(200);
  const animeXml = await animeSitemap.text();
  expect(animeXml).toContain(animePath);
  expect(animeXml).toContain(library.anime.slug);

  const invalid = await request.get("/sitemaps.xml/anime/nope");
  expect(invalid.status()).toBe(400);
});
