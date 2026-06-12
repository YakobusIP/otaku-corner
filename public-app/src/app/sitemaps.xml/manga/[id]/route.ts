import { mangaService } from "@/services/manga.service";

import { createMediaSitemapHandler } from "@/lib/sitemap/media-sitemap-route";

export const dynamic = "force-dynamic";

const { GET } = createMediaSitemapHandler("manga", (page, limit) =>
  mangaService.fetchSitemap(page, limit)
);

export { GET };