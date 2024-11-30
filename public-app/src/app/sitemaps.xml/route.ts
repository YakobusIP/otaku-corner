import { fetchTotalAnimeCount } from "@/services/anime.service";
import { fetchTotalLightNovelCount } from "@/services/lightnovel.service";
import { fetchTotalMangaCount } from "@/services/manga.service";

import { URL_OF_SITEMAPS } from "@/lib/constants";

import { NextResponse } from "next/server";

async function generateSitemaps() {
  const totalAnimeData = await fetchTotalAnimeCount();
  const totalMangaData = await fetchTotalMangaCount();
  const totalLightNovelData = await fetchTotalLightNovelCount();

  if (
    !totalAnimeData.success ||
    !totalMangaData.success ||
    !totalLightNovelData.success
  )
    return [];

  const numberOfAnimeSitemaps = Math.ceil(
    totalAnimeData.data.count / URL_OF_SITEMAPS
  );

  const numberOfMangaSitemaps = Math.ceil(
    totalMangaData.data.count / URL_OF_SITEMAPS
  );

  const numberOfLightNovelSitemaps = Math.ceil(
    totalLightNovelData.data.count / URL_OF_SITEMAPS
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

    console.log("Generated sitemaps:", sitemaps);

    const sitemapIndexXML = buildSitemapIndex(sitemaps);

    return new NextResponse(sitemapIndexXML, {
      headers: {
        "Content-Type": "application/xml",
        "Content-Length": Buffer.byteLength(sitemapIndexXML).toString()
      }
    });
  } catch (error) {
    console.error("Error generating sitemap index:", error);
    return NextResponse.error();
  }
}

function buildSitemapIndex(sitemaps: string[]) {
  // XML declaration and opening tag for the sitemap index.
  let xml = '<?xml version="1.0" encoding="UTF-8"?>';
  xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

  // Iterate over each sitemap URL and add it to the sitemap index.
  for (const sitemapURL of sitemaps) {
    xml += "<sitemap>";
    xml += `<loc>${sitemapURL}</loc>`; // Location tag specifying the URL of a sitemap file.
    xml += "</sitemap>";
  }

  // Closing tag for the sitemap index.
  xml += "</sitemapindex>";
  return xml;
}
