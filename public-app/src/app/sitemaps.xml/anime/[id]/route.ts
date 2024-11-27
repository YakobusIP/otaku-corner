import { fetchAnimeSitemap } from "@/services/anime.service";

import { URL_OF_SITEMAPS } from "@/lib/constants";

import { MetadataRoute } from "next";
import { NextResponse } from "next/server";

type Params = {
  id: number;
};

export async function GET(_: Request, { params }: { params: Promise<Params> }) {
  try {
    const id = Number((await params).id) + 1;
    const data = await fetchAnimeSitemap(id, URL_OF_SITEMAPS);

    if (!data.success) throw data.error;

    const sitemapIndexXML = buildSitemapIndex(
      data.data.map((item) => ({
        url: `${process.env.NEXT_PUBLIC_WEBSITE_URL}/anime/${item.id}/${item.slug}`,
        lastModified: item.updatedAt || item.createdAt,
        changeFrequency: "monthly",
        priority: 0.5
      }))
    );

    return new NextResponse(sitemapIndexXML, {
      headers: {
        "Content-Type": "application/xml",
        "Content-Length": Buffer.byteLength(sitemapIndexXML).toString()
      }
    });
  } catch (error) {
    console.error("Error generating anime sitemap:", error);
    return NextResponse.error();
  }
}

function buildSitemapIndex(sitemaps: MetadataRoute.Sitemap) {
  // XML declaration and opening tag for the sitemap index.
  let xml = '<?xml version="1.0" encoding="UTF-8"?>';
  xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

  // Iterate over each sitemap URL and add it to the sitemap index.
  for (const item of sitemaps) {
    xml += "<sitemap>";
    xml += `<loc>${item.url}</loc>`;
    xml += `<lastmod>${item.lastModified}</lastmod>`;
    xml += `<changefreq>${item.changeFrequency}</changefreq>`;
    xml += `<priority>${item.priority}</priority>`;
    xml += "</sitemap>";
  }

  // Closing tag for the sitemap index.
  xml += "</sitemapindex>";
  return xml;
}
