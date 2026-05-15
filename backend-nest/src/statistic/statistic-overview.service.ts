import { Injectable } from "@nestjs/common";

import { PrismaService } from "@/prisma/prisma.service";

import { Prisma } from "@prisma/client";

@Injectable()
export class StatisticOverviewService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllTimeStatistics() {
    const [
      consumedAnimeCount,
      consumedMangaCount,
      consumedLightNovelCount,
      animeMalAgg,
      mangaMalAgg,
      lightNovelMalAgg,
      animePersonalAgg,
      mangaPersonalAgg,
      lightNovelPersonalAgg
    ] = await Promise.all([
      this.prisma.animeReview.count({
        where: { progressStatus: { in: ["COMPLETED", "DROPPED"] } }
      }),
      this.prisma.mangaReview.count({
        where: { progressStatus: { in: ["COMPLETED", "DROPPED"] } }
      }),
      this.prisma.lightNovelReview.count({
        where: { progressStatus: { in: ["COMPLETED", "DROPPED"] } }
      }),
      this.prisma.anime.aggregate({
        where: { score: { not: null } },
        _sum: { score: true },
        _count: { id: true }
      }),
      this.prisma.manga.aggregate({
        where: { score: { not: null } },
        _sum: { score: true },
        _count: { id: true }
      }),
      this.prisma.lightNovel.aggregate({
        where: { score: { not: null } },
        _sum: { score: true },
        _count: { id: true }
      }),
      this.prisma.animeReview.aggregate({
        where: { personalScore: { not: null } },
        _sum: { personalScore: true },
        _count: { id: true }
      }),
      this.prisma.mangaReview.aggregate({
        where: { personalScore: { not: null } },
        _sum: { personalScore: true },
        _count: { id: true }
      }),
      this.prisma.lightNovelReview.aggregate({
        where: { personalScore: { not: null } },
        _sum: { personalScore: true },
        _count: { id: true }
      })
    ]);

    const malSum =
      (animeMalAgg._sum.score ?? 0) +
      (mangaMalAgg._sum.score ?? 0) +
      (lightNovelMalAgg._sum.score ?? 0);
    const malCount =
      animeMalAgg._count.id +
      mangaMalAgg._count.id +
      lightNovelMalAgg._count.id;
    const averageMalScore =
      malCount === 0 ? 0 : Math.round((malSum / malCount) * 100) / 100;

    const personalSum =
      (animePersonalAgg._sum.personalScore ?? 0) +
      (mangaPersonalAgg._sum.personalScore ?? 0) +
      (lightNovelPersonalAgg._sum.personalScore ?? 0);
    const personalCount =
      animePersonalAgg._count.id +
      mangaPersonalAgg._count.id +
      lightNovelPersonalAgg._count.id;
    const averagePersonalScore =
      personalCount === 0
        ? 0
        : Math.round((personalSum / personalCount) * 100) / 100;

    return {
      allMediaCount:
        consumedAnimeCount + consumedMangaCount + consumedLightNovelCount,
      animeCount: consumedAnimeCount,
      mangaCount: consumedMangaCount,
      lightNovelCount: consumedLightNovelCount,
      averageMalScore,
      averagePersonalScore
    };
  }

  async getTopMediaAndYearlyCount() {
    const currentYear = new Date().getFullYear();
    const startDate = new Date(currentYear, 0, 1);
    const endDate = new Date(currentYear, 11, 31, 23, 59, 59, 999);

    const [
      consumedAnimeYearlyCount,
      highestAnime,
      consumedMangaYearlyCount,
      highestManga,
      consumedLightNovelYearlyCount,
      highestLightNovel
    ] = await Promise.all([
      this.prisma.anime.count({
        where: {
          review: { consumedAt: { gte: startDate, lte: endDate } }
        }
      }),
      this.prisma.anime.findMany({
        select: {
          id: true,
          slug: true,
          images: true,
          title: true,
          titleJapanese: true,
          review: { select: { personalScore: true } }
        },
        orderBy: {
          review: { personalScore: { sort: "desc", nulls: "last" } }
        },
        take: 1
      }),
      this.prisma.manga.count({
        where: {
          review: { consumedAt: { gte: startDate, lte: endDate } }
        }
      }),
      this.prisma.manga.findMany({
        select: {
          id: true,
          slug: true,
          images: true,
          title: true,
          titleJapanese: true,
          review: { select: { personalScore: true } }
        },
        orderBy: {
          review: { personalScore: { sort: "desc", nulls: "last" } }
        },
        take: 1
      }),
      this.prisma.lightNovelVolumes.count({
        where: { consumedAt: { gte: startDate, lte: endDate } }
      }),
      this.prisma.lightNovel.findMany({
        select: {
          id: true,
          slug: true,
          images: true,
          title: true,
          titleJapanese: true,
          review: { select: { personalScore: true } }
        },
        orderBy: {
          review: { personalScore: { sort: "desc", nulls: "last" } }
        },
        take: 1
      })
    ]);

    const prepareResults = (
      count: number,
      items: {
        id: number;
        slug: string;
        title: string;
        titleJapanese: string;
        images: Prisma.JsonValue;
        review: { personalScore: number | null } | null;
      }[]
    ) => ({
      count,
      id: items.length > 0 ? items[0].id : null,
      slug: items.length > 0 ? items[0].slug : null,
      images: items.length > 0 ? items[0].images : null,
      title: items.length > 0 ? items[0].title : null,
      titleJapanese: items.length > 0 ? items[0].titleJapanese : null,
      score: items.length > 0 ? (items[0].review?.personalScore ?? null) : null
    });

    return {
      anime: prepareResults(consumedAnimeYearlyCount, highestAnime),
      manga: prepareResults(consumedMangaYearlyCount, highestManga),
      lightNovel: prepareResults(
        consumedLightNovelYearlyCount,
        highestLightNovel
      )
    };
  }
}
