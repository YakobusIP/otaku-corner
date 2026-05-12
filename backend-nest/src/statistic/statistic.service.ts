import { BadRequestException, Injectable } from "@nestjs/common";

import { PrismaService } from "@/prisma/prisma.service";

import { StatisticsView } from "@/statistic/enums/statistics-view.enum";

import { Prisma, ProgressStatus } from "@prisma/client";

type RawMediaConsumption = {
  period: string;
  count: number;
};

type ValidTable = "Anime" | "Manga" | "LightNovel";

type MediaConsumption = {
  period: string;
  animeCount: number;
  mangaCount: number;
  lightNovelCount: number;
};

type GenreConsumption = {
  name: string;
  animeCount: number;
  mangaCount: number;
  lightNovelCount: number;
  totalCount: number;
};

type StudioConsumption = {
  name: string;
  animeCount: number;
  totalCount: number;
};

type ThemeConsumption = {
  name: string;
  animeCount: number;
  mangaCount: number;
  lightNovelCount: number;
  totalCount: number;
};

type AuthorConsumption = {
  name: string;
  mangaCount: number;
  lightNovelCount: number;
  totalCount: number;
};

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

const TABLE_CONFIG: Record<
  ValidTable,
  { joinClause: Prisma.Sql; consumedAtField: string }
> = {
  Anime: {
    joinClause: Prisma.sql`"AnimeReview" review ON core."id" = review."animeId"`,
    consumedAtField: `review."consumedAt"`
  },
  Manga: {
    joinClause: Prisma.sql`"MangaReview" review ON core."id" = review."mangaId"`,
    consumedAtField: `review."consumedAt"`
  },
  LightNovel: {
    joinClause: Prisma.sql`"LightNovelVolumes" volumes ON core."id" = volumes."lightNovelId"`,
    consumedAtField: `volumes."consumedAt"`
  }
};

@Injectable()
export class StatisticService {
  constructor(private readonly prisma: PrismaService) {}

  async getYearRange(): Promise<number[]> {
    const minMaxYearQuery = Prisma.sql`
      SELECT MIN(min_year) AS min_year, MAX(max_year) AS max_year FROM (
        SELECT MIN(EXTRACT(YEAR FROM "consumedAt")) AS min_year,
               MAX(EXTRACT(YEAR FROM "consumedAt")) AS max_year
        FROM ${Prisma.raw(`"AnimeReview"`)} WHERE "consumedAt" IS NOT NULL
        UNION ALL
        SELECT MIN(EXTRACT(YEAR FROM "consumedAt")) AS min_year,
               MAX(EXTRACT(YEAR FROM "consumedAt")) AS max_year
        FROM ${Prisma.raw(`"MangaReview"`)} WHERE "consumedAt" IS NOT NULL
        UNION ALL
        SELECT MIN(EXTRACT(YEAR FROM "consumedAt")) AS min_year,
               MAX(EXTRACT(YEAR FROM "consumedAt")) AS max_year
        FROM ${Prisma.raw(`"LightNovelVolumes"`)} WHERE "consumedAt" IS NOT NULL
      ) sub
    `;

    const result =
      await this.prisma.$queryRaw<
        { min_year: number | null; max_year: number | null }[]
      >(minMaxYearQuery);

    const minYear = result[0]?.min_year
      ? Math.floor(result[0].min_year)
      : new Date().getFullYear();
    const maxYear = result[0]?.max_year
      ? Math.floor(result[0].max_year)
      : new Date().getFullYear();

    const years: number[] = [];
    for (let y = minYear; y <= maxYear; y++) {
      years.push(y);
    }

    return years;
  }

  async getMediaConsumption(
    view: StatisticsView = StatisticsView.MONTHLY,
    year?: number
  ): Promise<MediaConsumption[]> {
    if (view === StatisticsView.MONTHLY && year === undefined) {
      throw new BadRequestException(
        "Year is required for monthly media consumption statistics"
      );
    }

    const tables: ValidTable[] = ["Anime", "Manga", "LightNovel"];

    const getConsumptionStatistics = async (
      table: ValidTable
    ): Promise<Map<string, number>> => {
      const config = TABLE_CONFIG[table];
      const { joinClause, consumedAtField } = config;

      const whereClause =
        view === StatisticsView.MONTHLY
          ? Prisma.sql`WHERE EXTRACT(YEAR FROM ${Prisma.raw(consumedAtField)}) = ${year} AND ${Prisma.raw(consumedAtField)} IS NOT NULL`
          : Prisma.sql`WHERE ${Prisma.raw(consumedAtField)} IS NOT NULL`;

      const periodSelection =
        view === StatisticsView.YEARLY
          ? Prisma.sql`EXTRACT(YEAR FROM ${Prisma.raw(consumedAtField)}) AS period`
          : Prisma.sql`EXTRACT(MONTH FROM ${Prisma.raw(consumedAtField)}) AS period`;

      const query = Prisma.sql`
        SELECT ${periodSelection}, COUNT(*)::INTEGER AS count
        FROM ${Prisma.raw(`"${table}" core`)}
        INNER JOIN ${joinClause}
        ${whereClause}
        GROUP BY period
        ORDER BY period ASC
      `;

      const result = await this.prisma.$queryRaw<RawMediaConsumption[]>(query);

      const countsMap = new Map<string, number>();
      result.forEach((row) => {
        const periodKey =
          view === StatisticsView.YEARLY
            ? row.period.toString()
            : MONTHS[Math.floor(Number(row.period) - 1)];
        countsMap.set(periodKey, row.count);
      });

      return countsMap;
    };

    const [animeCounts, mangaCounts, lightNovelCounts] = await Promise.all(
      tables.map((table) => getConsumptionStatistics(table))
    );

    const data: MediaConsumption[] = [];

    if (view === StatisticsView.YEARLY) {
      const years = await this.getYearRange();
      for (const yr of years) {
        const period = yr.toString();
        data.push({
          period,
          animeCount: animeCounts.get(period) ?? 0,
          mangaCount: mangaCounts.get(period) ?? 0,
          lightNovelCount: lightNovelCounts.get(period) ?? 0
        });
      }
    } else {
      for (const period of MONTHS) {
        data.push({
          period,
          animeCount: animeCounts.get(period) ?? 0,
          mangaCount: mangaCounts.get(period) ?? 0,
          lightNovelCount: lightNovelCounts.get(period) ?? 0
        });
      }
    }

    return data;
  }

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

  private cutoffForDashboardYear(year: number, now: Date): Date {
    if (year > now.getUTCFullYear()) {
      throw new BadRequestException("Year cannot be in the future");
    }
    const endOfYear = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));
    if (year < now.getUTCFullYear()) {
      return endOfYear;
    }
    return now.getTime() < endOfYear.getTime() ? now : endOfYear;
  }

  private shiftUtcYears(date: Date, deltaYears: number): Date {
    const copy = new Date(date.getTime());
    copy.setUTCFullYear(copy.getUTCFullYear() + deltaYears);
    return copy;
  }

  private async totalMediaAt(cutoff: Date): Promise<number> {
    const [anime, manga, lightNovel] = await Promise.all([
      this.prisma.anime.count({ where: { createdAt: { lte: cutoff } } }),
      this.prisma.manga.count({ where: { createdAt: { lte: cutoff } } }),
      this.prisma.lightNovel.count({ where: { createdAt: { lte: cutoff } } })
    ]);
    return anime + manga + lightNovel;
  }

  private async inProgressSnapshotAt(cutoff: Date): Promise<number> {
    const [animeC, mangaC, lnC] = await Promise.all([
      this.prisma.$queryRaw<[{ c: bigint }]>(Prisma.sql`
        SELECT COUNT(*)::bigint AS c FROM "AnimeReview" r
        WHERE (
          (r."progressStatus" = 'ON_PROGRESS' AND r."updatedAt" <= ${cutoff})
          OR (r."progressStatus" = 'COMPLETED' AND r."updatedAt" > ${cutoff})
        )
      `),
      this.prisma.$queryRaw<[{ c: bigint }]>(Prisma.sql`
        SELECT COUNT(*)::bigint AS c FROM "MangaReview" r
        WHERE (
          (r."progressStatus" = 'ON_PROGRESS' AND r."updatedAt" <= ${cutoff})
          OR (r."progressStatus" = 'COMPLETED' AND r."updatedAt" > ${cutoff})
        )
      `),
      this.prisma.$queryRaw<[{ c: bigint }]>(Prisma.sql`
        SELECT COUNT(*)::bigint AS c FROM "LightNovelReview" r
        WHERE (
          (r."progressStatus" = 'ON_PROGRESS' AND r."updatedAt" <= ${cutoff})
          OR (r."progressStatus" = 'COMPLETED' AND r."updatedAt" > ${cutoff})
        )
      `)
    ]);
    return (
      Number(animeC[0]?.c ?? 0n) +
      Number(mangaC[0]?.c ?? 0n) +
      Number(lnC[0]?.c ?? 0n)
    );
  }

  private async averagePersonalSnapshotAt(cutoff: Date): Promise<number> {
    const [a, m, ln] = await Promise.all([
      this.prisma.animeReview.aggregate({
        where: { personalScore: { not: null }, createdAt: { lte: cutoff } },
        _sum: { personalScore: true },
        _count: { id: true }
      }),
      this.prisma.mangaReview.aggregate({
        where: { personalScore: { not: null }, createdAt: { lte: cutoff } },
        _sum: { personalScore: true },
        _count: { id: true }
      }),
      this.prisma.lightNovelReview.aggregate({
        where: { personalScore: { not: null }, createdAt: { lte: cutoff } },
        _sum: { personalScore: true },
        _count: { id: true }
      })
    ]);
    const sum =
      (a._sum.personalScore ?? 0) +
      (m._sum.personalScore ?? 0) +
      (ln._sum.personalScore ?? 0);
    const n = a._count.id + m._count.id + ln._count.id;
    return n === 0 ? 0 : Math.round((sum / n) * 100) / 100;
  }

  private async maxPersonalSnapshotAt(cutoff: Date): Promise<number> {
    const [a, m, ln] = await Promise.all([
      this.prisma.animeReview.aggregate({
        where: { personalScore: { not: null }, createdAt: { lte: cutoff } },
        _max: { personalScore: true }
      }),
      this.prisma.mangaReview.aggregate({
        where: { personalScore: { not: null }, createdAt: { lte: cutoff } },
        _max: { personalScore: true }
      }),
      this.prisma.lightNovelReview.aggregate({
        where: { personalScore: { not: null }, createdAt: { lte: cutoff } },
        _max: { personalScore: true }
      })
    ]);
    return Math.max(
      a._max.personalScore ?? 0,
      m._max.personalScore ?? 0,
      ln._max.personalScore ?? 0
    );
  }

  private buildKpiMetric(current: number, previous: number) {
    const changeAbsolute = Math.round((current - previous) * 100) / 100;
    const changePercent =
      previous === 0
        ? current === 0
          ? 0
          : 100
        : Math.round(((current - previous) / previous) * 1000) / 10;
    return {
      value: current,
      previousValue: previous,
      changePercent,
      changeAbsolute
    };
  }

  async getDashboardKpis(year: number) {
    const now = new Date();
    const cutoff = this.cutoffForDashboardYear(year, now);
    const priorCutoff = this.shiftUtcYears(cutoff, -1);

    const [
      totalMediaNow,
      totalMediaPrev,
      inProgressNow,
      inProgressPrev,
      avgNow,
      avgPrev,
      topNow,
      topPrev
    ] = await Promise.all([
      this.totalMediaAt(cutoff),
      this.totalMediaAt(priorCutoff),
      this.inProgressSnapshotAt(cutoff),
      this.inProgressSnapshotAt(priorCutoff),
      this.averagePersonalSnapshotAt(cutoff),
      this.averagePersonalSnapshotAt(priorCutoff),
      this.maxPersonalSnapshotAt(cutoff),
      this.maxPersonalSnapshotAt(priorCutoff)
    ]);

    return {
      year,
      cutoffAt: cutoff.toISOString(),
      priorCutoffAt: priorCutoff.toISOString(),
      totalMedia: this.buildKpiMetric(totalMediaNow, totalMediaPrev),
      inProgress: this.buildKpiMetric(inProgressNow, inProgressPrev),
      averagePersonalScore: this.buildKpiMetric(avgNow, avgPrev),
      topRatedPersonalScore: this.buildKpiMetric(topNow, topPrev)
    };
  }

  async getDashboardKpisAllTime() {
    const now = new Date();
    const [totalMediaNow, inProgressNow, avgNow, topNow] = await Promise.all([
      this.totalMediaAt(now),
      this.inProgressSnapshotAt(now),
      this.averagePersonalSnapshotAt(now),
      this.maxPersonalSnapshotAt(now)
    ]);

    return {
      year: null,
      cutoffAt: now.toISOString(),
      priorCutoffAt: now.toISOString(),
      totalMedia: this.buildKpiMetric(totalMediaNow, totalMediaNow),
      inProgress: this.buildKpiMetric(inProgressNow, inProgressNow),
      averagePersonalScore: this.buildKpiMetric(avgNow, avgNow),
      topRatedPersonalScore: this.buildKpiMetric(topNow, topNow)
    };
  }

  private topRatedYearBounds(year: number, now: Date) {
    if (year > now.getUTCFullYear()) {
      throw new BadRequestException("Year cannot be in the future");
    }
    const start = new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0));
    const endOfYear = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));
    const end =
      year === now.getUTCFullYear() && now.getTime() < endOfYear.getTime()
        ? now
        : endOfYear;
    return { start, end };
  }

  async getTopRatedThisYear(year: number) {
    const now = new Date();
    const { start, end } = this.topRatedYearBounds(year, now);

    const [topAnime, topManga, topLightNovel] = await Promise.all([
      this.prisma.anime.findFirst({
        where: {
          review: {
            personalScore: { not: null },
            consumedAt: { not: null, gte: start, lte: end }
          }
        },
        orderBy: { review: { personalScore: "desc" } },
        select: {
          id: true,
          slug: true,
          title: true,
          images: true,
          review: { select: { personalScore: true } }
        }
      }),
      this.prisma.manga.findFirst({
        where: {
          review: {
            personalScore: { not: null },
            consumedAt: { not: null, gte: start, lte: end }
          }
        },
        orderBy: { review: { personalScore: "desc" } },
        select: {
          id: true,
          slug: true,
          title: true,
          images: true,
          review: { select: { personalScore: true } }
        }
      }),
      this.prisma.lightNovel.findFirst({
        where: {
          review: { personalScore: { not: null } },
          volumeProgress: {
            some: {
              consumedAt: { not: null, gte: start, lte: end }
            }
          }
        },
        orderBy: { review: { personalScore: "desc" } },
        select: {
          id: true,
          slug: true,
          title: true,
          images: true,
          review: { select: { personalScore: true } }
        }
      })
    ]);

    const pack = (
      row: {
        id: number;
        slug: string;
        title: string;
        images: Prisma.JsonValue;
        review: { personalScore: number | null } | null;
      } | null
    ) =>
      row
        ? {
            id: row.id,
            slug: row.slug,
            title: row.title,
            images: row.images,
            personalScore: row.review?.personalScore ?? null
          }
        : null;

    return {
      year,
      anime: pack(topAnime),
      manga: pack(topManga),
      lightNovel: pack(topLightNovel)
    };
  }

  async getTopRatedAllTime() {
    const [topAnime, topManga, topLightNovel] = await Promise.all([
      this.prisma.anime.findFirst({
        where: { review: { personalScore: { not: null } } },
        orderBy: { review: { personalScore: "desc" } },
        select: {
          id: true,
          slug: true,
          title: true,
          images: true,
          review: { select: { personalScore: true } }
        }
      }),
      this.prisma.manga.findFirst({
        where: { review: { personalScore: { not: null } } },
        orderBy: { review: { personalScore: "desc" } },
        select: {
          id: true,
          slug: true,
          title: true,
          images: true,
          review: { select: { personalScore: true } }
        }
      }),
      this.prisma.lightNovel.findFirst({
        where: { review: { personalScore: { not: null } } },
        orderBy: { review: { personalScore: "desc" } },
        select: {
          id: true,
          slug: true,
          title: true,
          images: true,
          review: { select: { personalScore: true } }
        }
      })
    ]);

    const pack = (
      row: {
        id: number;
        slug: string;
        title: string;
        images: Prisma.JsonValue;
        review: { personalScore: number | null } | null;
      } | null
    ) =>
      row
        ? {
            id: row.id,
            slug: row.slug,
            title: row.title,
            images: row.images,
            personalScore: row.review?.personalScore ?? null
          }
        : null;

    return {
      year: null,
      anime: pack(topAnime),
      manga: pack(topManga),
      lightNovel: pack(topLightNovel)
    };
  }

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

  private withLibrarySharePercentages<
    T extends { totalCount: number | bigint }
  >(rows: T[], libraryTotal: number): (T & { percentage: number })[] {
    const denom = libraryTotal <= 0 ? 0 : libraryTotal;
    return rows.map((r) => {
      const rowTotal = Number(r.totalCount);
      return {
        ...r,
        percentage: denom === 0 ? 0 : Math.round((rowTotal / denom) * 1000) / 10
      };
    });
  }

  private async tasteGenresLibraryTotal(): Promise<number> {
    const rows = await this.prisma.$queryRaw<[{ total: bigint }]>(Prisma.sql`
      SELECT COALESCE(SUM(sub.c), 0)::bigint AS total
      FROM (
        SELECT
          (COUNT(DISTINCT ag."animeId")::bigint
            + COUNT(DISTINCT mg."mangaId")::bigint
            + COUNT(DISTINCT lg."lightNovelId")::bigint) AS c
        FROM "Genre" g
        LEFT JOIN "AnimeGenres" ag ON g.id = ag."genreId"
        LEFT JOIN "MangaGenres" mg ON g.id = mg."genreId"
        LEFT JOIN "LightNovelGenres" lg ON g.id = lg."genreId"
        GROUP BY g.id
      ) sub
    `);
    return Number(rows[0]?.total ?? 0n);
  }

  private async tasteThemesLibraryTotal(): Promise<number> {
    const rows = await this.prisma.$queryRaw<[{ total: bigint }]>(Prisma.sql`
      SELECT COALESCE(SUM(sub.c), 0)::bigint AS total
      FROM (
        SELECT
          (COUNT(DISTINCT at2."animeId")::bigint
            + COUNT(DISTINCT mt."mangaId")::bigint
            + COUNT(DISTINCT lnt."lightNovelId")::bigint) AS c
        FROM "Theme" t
        LEFT JOIN "AnimeThemes" at2 ON t.id = at2."themeId"
        LEFT JOIN "MangaThemes" mt ON t.id = mt."themeId"
        LEFT JOIN "LightNovelThemes" lnt ON t.id = lnt."themeId"
        GROUP BY t.id
      ) sub
    `);
    return Number(rows[0]?.total ?? 0n);
  }

  private async tasteStudiosLibraryTotal(): Promise<number> {
    const rows = await this.prisma.$queryRaw<[{ total: bigint }]>(Prisma.sql`
      SELECT COALESCE(SUM(sub.c), 0)::bigint AS total
      FROM (
        SELECT COUNT(DISTINCT as2."animeId")::bigint AS c
        FROM "Studio" s
        LEFT JOIN "AnimeStudios" as2 ON s.id = as2."studioId"
        GROUP BY s.id
      ) sub
    `);
    return Number(rows[0]?.total ?? 0n);
  }

  private async tasteAuthorsLibraryTotal(): Promise<number> {
    const rows = await this.prisma.$queryRaw<[{ total: bigint }]>(Prisma.sql`
      SELECT COALESCE(SUM(sub.c), 0)::bigint AS total
      FROM (
        SELECT
          (COUNT(DISTINCT ma."mangaId")::bigint
            + COUNT(DISTINCT lna."lightNovelId")::bigint) AS c
        FROM "Author" a
        LEFT JOIN "MangaAuthors" ma ON a.id = ma."authorId"
        LEFT JOIN "LightNovelAuthors" lna ON a.id = lna."authorId"
        GROUP BY a.id
      ) sub
    `);
    return Number(rows[0]?.total ?? 0n);
  }

  async getTasteProfile(limit: number) {
    const lim = Number(limit);
    const genreQuery = Prisma.sql`
      SELECT 
        g.name, 
        COUNT(DISTINCT ag."animeId")::INTEGER AS "animeCount",
        COUNT(DISTINCT mg."mangaId")::INTEGER AS "mangaCount",
        COUNT(DISTINCT lg."lightNovelId")::INTEGER AS "lightNovelCount",
        (COUNT(DISTINCT ag."animeId")::INTEGER + COUNT(DISTINCT mg."mangaId")::INTEGER + COUNT(DISTINCT lg."lightNovelId")::INTEGER) AS "totalCount"
      FROM "Genre" g
      LEFT JOIN "AnimeGenres" ag ON g.id = ag."genreId" 
      LEFT JOIN "MangaGenres" mg ON g.id = mg."genreId" 
      LEFT JOIN "LightNovelGenres" lg ON g.id = lg."genreId" 
      GROUP BY g.name
      ORDER BY "totalCount" DESC
      LIMIT ${lim}
    `;
    const themeQuery = Prisma.sql`
      SELECT 
        t.name, 
        COUNT(DISTINCT at2."animeId")::INTEGER AS "animeCount",
        COUNT(DISTINCT mt."mangaId")::INTEGER AS "mangaCount",
        COUNT(DISTINCT lnt."lightNovelId")::INTEGER AS "lightNovelCount",
        (COUNT(DISTINCT at2."animeId")::INTEGER + COUNT(DISTINCT mt."mangaId")::INTEGER + COUNT(DISTINCT lnt."lightNovelId")::INTEGER) AS "totalCount"
      FROM "Theme" t 
      LEFT JOIN "AnimeThemes" at2 ON t.id = at2."themeId" 
      LEFT JOIN "MangaThemes" mt ON t.id = mt."themeId" 
      LEFT JOIN "LightNovelThemes" lnt ON t.id = lnt."themeId" 
      GROUP BY t.name
      ORDER BY "totalCount" DESC
      LIMIT ${lim}
    `;
    const studioQuery = Prisma.sql`
      SELECT 
        s.name, 
        COUNT(DISTINCT as2."animeId")::INTEGER AS "animeCount",
        COUNT(DISTINCT as2."animeId")::INTEGER AS "totalCount"
      FROM "Studio" s 
      LEFT JOIN "AnimeStudios" as2 ON s.id = as2."studioId" 
      GROUP BY s.name
      ORDER BY "totalCount" DESC
      LIMIT ${lim}
    `;
    const authorQuery = Prisma.sql`
      SELECT 
        a.name, 
        COUNT(DISTINCT ma."mangaId")::INTEGER AS "mangaCount",
        COUNT(DISTINCT lna."lightNovelId")::INTEGER AS "lightNovelCount",
        (COUNT(DISTINCT ma."mangaId")::INTEGER + COUNT(DISTINCT lna."lightNovelId")::INTEGER) AS "totalCount"
      FROM "Author" a 
      LEFT JOIN "MangaAuthors" ma ON a.id = ma."authorId" 
      LEFT JOIN "LightNovelAuthors" lna ON a.id = lna."authorId" 
      GROUP BY a.name
      ORDER BY "totalCount" DESC
      LIMIT ${lim}
    `;

    const [
      genreLibraryTotal,
      themeLibraryTotal,
      studioLibraryTotal,
      authorLibraryTotal,
      genres,
      themes,
      studios,
      authors
    ] = await Promise.all([
      this.tasteGenresLibraryTotal(),
      this.tasteThemesLibraryTotal(),
      this.tasteStudiosLibraryTotal(),
      this.tasteAuthorsLibraryTotal(),
      this.prisma.$queryRaw<GenreConsumption[]>(genreQuery),
      this.prisma.$queryRaw<ThemeConsumption[]>(themeQuery),
      this.prisma.$queryRaw<StudioConsumption[]>(studioQuery),
      this.prisma.$queryRaw<AuthorConsumption[]>(authorQuery)
    ]);

    return {
      genres: this.withLibrarySharePercentages(genres, genreLibraryTotal),
      themes: this.withLibrarySharePercentages(themes, themeLibraryTotal),
      studios: this.withLibrarySharePercentages(studios, studioLibraryTotal),
      authors: this.withLibrarySharePercentages(authors, authorLibraryTotal)
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
