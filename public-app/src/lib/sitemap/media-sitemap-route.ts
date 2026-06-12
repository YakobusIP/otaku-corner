import type { PublicMediaTypeId } from "@/lib/media/public-media-type";
import { PUBLIC_MEDIA_TYPE_CONFIG } from "@/lib/media/public-media-type";

import { URL_OF_SITEMAPS } from "@/lib/shared/constants";
import { buildUrlsetXml } from "@/lib/sitemap/sitemap-xml";

import { NextResponse } from "next/server";

type SitemapEntry = {
  id: number;
  slug: string;
  updatedAt: Date | string;
  createdAt: Date | string;
};

type FetchSitemapFn = (page: number, limit: number) => Promise<SitemapEntry[]>;

const parseSitemapPageParam = (raw: string): number => {
  if (!/^\d+$/.test(raw)) return -1;
  const id = Number(raw) + 1;
  if (!Number.isInteger(id) || id < 1) return -1;
  return id;
};

export const createMediaSitemapHandler = (
  mediaType: PublicMediaTypeId,
  fetchSitemap: FetchSitemapFn
) => {
  const { detailPathSegment, navLabel } = PUBLIC_MEDIA_TYPE_CONFIG[mediaType];

  type Params = {
    id: string;
  };

  const GET = async (_: Request, { params }: { params: Promise<Params> }) => {
    const page = parseSitemapPageParam((await params).id);
    if (page === -1) {
      return new NextResponse("Invalid page parameter", { status: 400 });
    }

    try {
      const data = await fetchSitemap(page, URL_OF_SITEMAPS);

      const urlsetXml = buildUrlsetXml(
        data.map((item) => ({
          loc: `${process.env.NEXT_PUBLIC_WEBSITE_URL}/${detailPathSegment}/${item.id}/${item.slug}`,
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
      console.error(`Error generating ${navLabel} sitemap:`, error);
      return NextResponse.error();
    }
  };

  return { GET };
};