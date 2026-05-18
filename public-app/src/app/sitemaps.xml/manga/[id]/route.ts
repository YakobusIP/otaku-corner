import { mangaService } from "@/services/manga.service";

import { URL_OF_SITEMAPS } from "@/lib/constants";
import { buildUrlsetXml } from "@/lib/sitemap-xml";

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type Params = {
  id: number;
};

export async function GET(_: Request, { params }: { params: Promise<Params> }) {
  try {
    const id = Number((await params).id) + 1;
    const data = await mangaService.fetchSitemap(id, URL_OF_SITEMAPS);

    const urlsetXml = buildUrlsetXml(
      data.map((item) => ({
        loc: `${process.env.NEXT_PUBLIC_WEBSITE_URL}/manga/${item.id}/${item.slug}`,
        lastModified: item.updatedAt || item.createdAt,
        changeFrequency: "monthly",
        priority: 0.5
      }))
    );

    return new NextResponse(urlsetXml, {
      headers: {
        "Content-Type": "application/xml",
        "Content-Length": Buffer.byteLength(urlsetXml).toString()
      }
    });
  } catch (error) {
    console.error("Error generating manga sitemap:", error);
    return NextResponse.error();
  }
}
