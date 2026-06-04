import { Injectable } from "@nestjs/common";

import { PrismaService } from "@/prisma/prisma.service";

import { Prisma, ProgressStatus } from "@prisma/client";

@Injectable()
export class StatisticLibraryService {
  constructor(private readonly prisma: PrismaService) {}

  async getLibraryHealth() {
    const allStatuses = Object.values(ProgressStatus);

    const [animeG, mangaG, lnG] = await Promise.all([
      this.prisma.animeReview.groupBy({
        by: ["progressStatus"],
        where: { progressStatus: { in: allStatuses } },
        _count: { progressStatus: true }
      }),
      this.prisma.mangaReview.groupBy({
        by: ["progressStatus"],
        where: { progressStatus: { in: allStatuses } },
        _count: { progressStatus: true }
      }),
      this.prisma.lightNovelReview.groupBy({
        by: ["progressStatus"],
        where: { progressStatus: { in: allStatuses } },
        _count: { progressStatus: true }
      })
    ]);

    const merge = new Map<string, number>();
    const addAll = (
      rows: {
        progressStatus: ProgressStatus;
        _count: { progressStatus: number };
      }[]
    ) => {
      for (const row of rows) {
        const key = row.progressStatus;
        merge.set(key, (merge.get(key) ?? 0) + row._count.progressStatus);
      }
    };
    addAll(animeG);
    addAll(mangaG);
    addAll(lnG);

    const segments = allStatuses.map((status) => ({
      status,
      count: merge.get(status) ?? 0
    }));
    const total = segments.reduce((s, x) => s + x.count, 0);
    return {
      total,
      segments: segments.map((s) => ({
        ...s,
        percentage: total === 0 ? 0 : Math.round((s.count / total) * 1000) / 10
      }))
    };
  }

  async getRecentReviews(limit: number) {
    const takeEach = Math.min(50, Math.max(limit, 10));

    type ReviewRow = {
      mediaType: "anime" | "manga" | "lightNovel";
      mediaId: number;
      slug: string;
      title: string;
      images: Prisma.JsonValue;
      personalScore: number | null;
      updatedAt: Date;
    };

    const [animeRows, mangaRows, lnRows] = await Promise.all([
      this.prisma.animeReview.findMany({
        orderBy: { updatedAt: "desc" },
        take: takeEach,
        select: {
          updatedAt: true,
          personalScore: true,
          anime: {
            select: { id: true, slug: true, title: true, images: true }
          }
        }
      }),
      this.prisma.mangaReview.findMany({
        orderBy: { updatedAt: "desc" },
        take: takeEach,
        select: {
          updatedAt: true,
          personalScore: true,
          manga: {
            select: { id: true, slug: true, title: true, images: true }
          }
        }
      }),
      this.prisma.lightNovelReview.findMany({
        orderBy: { updatedAt: "desc" },
        take: takeEach,
        select: {
          updatedAt: true,
          personalScore: true,
          lightNovel: {
            select: { id: true, slug: true, title: true, images: true }
          }
        }
      })
    ]);

    const merged: ReviewRow[] = [
      ...animeRows.map((row) => ({
        mediaType: "anime" as const,
        mediaId: row.anime.id,
        slug: row.anime.slug,
        title: row.anime.title,
        images: row.anime.images,
        personalScore: row.personalScore,
        updatedAt: row.updatedAt
      })),
      ...mangaRows.map((row) => ({
        mediaType: "manga" as const,
        mediaId: row.manga.id,
        slug: row.manga.slug,
        title: row.manga.title,
        images: row.manga.images,
        personalScore: row.personalScore,
        updatedAt: row.updatedAt
      })),
      ...lnRows.map((row) => ({
        mediaType: "lightNovel" as const,
        mediaId: row.lightNovel.id,
        slug: row.lightNovel.slug,
        title: row.lightNovel.title,
        images: row.lightNovel.images,
        personalScore: row.personalScore,
        updatedAt: row.updatedAt
      }))
    ];

    merged.sort((a, b) => {
      const dt = b.updatedAt.getTime() - a.updatedAt.getTime();
      if (dt !== 0) {
        return dt;
      }
      if (a.mediaType !== b.mediaType) {
        return a.mediaType.localeCompare(b.mediaType);
      }
      return a.mediaId - b.mediaId;
    });

    return merged.slice(0, limit).map((row) => ({
      mediaType: row.mediaType,
      mediaId: row.mediaId,
      slug: row.slug,
      title: row.title,
      images: row.images,
      personalScore: row.personalScore,
      updatedAt: row.updatedAt.toISOString()
    }));
  }
}
