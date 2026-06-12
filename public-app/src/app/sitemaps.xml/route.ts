import { animeService } from "@/services/anime.service";
import { lightNovelService } from "@/services/lightnovel.service";
import { mangaService } from "@/services/manga.service";

import { URL_OF_SITEMAPS } from "@/lib/shared/constants";
import { buildSitemapIndexXml } from "@/lib/sitemap/sitemap-xml";

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function generateSitemaps() {
  const [totalAnimeData, totalMangaData, totalLightNovelData] =
    await Promise.all([
      animeService.fetchTotalCount(),
      mangaService.fetchTotalCount(),
      lightNovelService.fetchTotalCount()
    ]);

  const numberOfAnimeSitemaps = Math.ceil(
    totalAnimeData.count / URL_OF_SITEMAPS
  );

  const numberOfMangaSitemaps = Math.ceil(
    totalMangaData.count / URL_OF_SITEMAPS
  );

  const numberOfLightNovelSitemaps = Math.ceil(
    totalLightNovelData.count / URL_OF_SITEMAPS
  );

  const animeSitemaps = Array.from(
    { length: numberOfAnimeSitemaps },
    (_, index) => ({
      id: index,
      url: `${process.env.NEXT_PUBLIC_WEBSITE_URL}/sitemap-anime-${index}.xml`
    })
  );

  const mangaSitemaps = Array.from(
    { length: numberOfMangaSitemaps },
    (_, index) => ({
      id: index,
      url: `${process.env.NEXT_PUBLIC_WEBSITE_URL}/sitemap-manga-${index}.xml`
    })
  );

  const lightNovelSitemaps = Array.from(
    { length: numberOfLightNovelSitemaps },
    (_, index) => ({
      id: index,
      url: `${process.env.NEXT_PUBLIC_WEBSITE_URL}/sitemap-light-novel-${index}.xml`
    })
  );

  return [...animeSitemaps, ...mangaSitemaps, ...lightNovelSitemaps];
}

export async function GET() {
  try {
    const dynamicSitemaps = await generateSitemaps();

    const sitemaps = [
      `${process.env.NEXT_PUBLIC_WEBSITE_URL}/sitemap.xml`,
      ...dynamicSitemaps.map((sitemap) => sitemap.url)
    ];

    const sitemapIndexXML = buildSitemapIndexXml(sitemaps);

    return new NextResponse(sitemapIndexXML, {
      headers: {
        "Content-Type": "application/xml",
        "Content-Length": Buffer.byteLength(sitemapIndexXML).toString()
      }
    });
  } catch (error) {
    console.error("Error generating sitemap index:", error);
    return new NextResponse(null, {
      status: 503,
      headers: {
        "Retry-After": "300"
      }
    });
  }
}
