import { animeService } from "@/services/anime.service";

import { createMediaSitemapHandler } from "@/lib/sitemap/media-sitemap-route";

export const dynamic = "force-dynamic";

const { GET } = createMediaSitemapHandler("anime", (page, limit) =>
  animeService.fetchSitemap(page, limit)
);

export { GET };