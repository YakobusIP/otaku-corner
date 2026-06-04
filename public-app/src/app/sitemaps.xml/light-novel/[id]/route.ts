import { lightNovelService } from "@/services/lightnovel.service";

import { createMediaSitemapHandler } from "@/lib/sitemap/media-sitemap-route";

export const dynamic = "force-dynamic";

const { GET } = createMediaSitemapHandler("lightNovel", (page, limit) =>
  lightNovelService.fetchSitemap(page, limit)
);

export { GET };