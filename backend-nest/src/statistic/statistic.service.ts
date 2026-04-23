import { BadRequestException, Injectable } from "@nestjs/common";

import { PrismaService } from "@/prisma/prisma.service";

import { MediaValue } from "@/statistic/dto/statistic-query.dto";
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

type MediaProgressMap = {
  status: string;
  count: number;
};

type RawMediaProgressData = {
  progressStatus: ProgressStatus;
  _count: {
    progressStatus: number;
  };
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

  async getMediaProgress(media: MediaValue): Promise<MediaProgressMap[]> {
    const allProgressStatus = Object.values(ProgressStatus);
    const progressMap = new Map<string, MediaProgressMap>();

    allProgressStatus.forEach((status) => {
      progressMap.set(status, { status, count: 0 });
    });

    const updateProgressMap = (rawData: RawMediaProgressData[]) => {
      rawData.forEach((item) => {
        const current = progressMap.get(item.progressStatus)!;
        current.count = item._count.progressStatus;
      });
    };

    if (media === "anime") {
      const raw = await this.prisma.animeReview.groupBy({
        by: ["progressStatus"],
        _count: { progressStatus: true }
      });
      updateProgressMap(raw);
    } else if (media === "manga") {
      const raw = await this.prisma.mangaReview.groupBy({
        by: ["progressStatus"],
        _count: { progressStatus: true }
      });
      updateProgressMap(raw);
    } else if (media === "lightNovel") {
      const raw = await this.prisma.lightNovelReview.groupBy({
        by: ["progressStatus"],
        _count: { progressStatus: true }
      });
      updateProgressMap(raw);
    }

    return Array.from(progressMap.values());
  }

  async getGenreConsumption(): Promise<GenreConsumption[]> {
    const query = Prisma.sql`
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
      LIMIT 5
    `;

    return this.prisma.$queryRaw<GenreConsumption[]>(query);
  }

  async getStudioConsumption(): Promise<StudioConsumption[]> {
    const query = Prisma.sql`
      SELECT 
        s.name, 
        COUNT(DISTINCT as2."animeId")::INTEGER AS "animeCount",
        COUNT(DISTINCT as2."animeId")::INTEGER AS "totalCount"
      FROM "Studio" s 
      LEFT JOIN "AnimeStudios" as2 ON s.id = as2."studioId" 
      GROUP BY s.name
      ORDER BY "totalCount" DESC
      LIMIT 5
    `;

    return this.prisma.$queryRaw<StudioConsumption[]>(query);
  }

  async getThemeConsumption(): Promise<ThemeConsumption[]> {
    const query = Prisma.sql`
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
      LIMIT 5
    `;

    return this.prisma.$queryRaw<ThemeConsumption[]>(query);
  }

  async getAuthorConsumption(): Promise<AuthorConsumption[]> {
    const query = Prisma.sql`
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
      LIMIT 5
    `;

    return this.prisma.$queryRaw<AuthorConsumption[]>(query);
  }

  async getAllTimeStatistics() {
    const [
      consumedAnimeCount,
      consumedMangaCount,
      consumedLightNovelCount,
      averageAnimeMALScores,
      averageMangaMALScores,
      averageLightNovelMALScores,
      averageAnimePersonalScores,
      averageMangaPersonalScores,
      averageLightNovelPersonalScores
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
      this.prisma.anime.aggregate({ _avg: { score: true } }),
      this.prisma.manga.aggregate({ _avg: { score: true } }),
      this.prisma.lightNovel.aggregate({ _avg: { score: true } }),
      this.prisma.animeReview.aggregate({ _avg: { personalScore: true } }),
      this.prisma.mangaReview.aggregate({ _avg: { personalScore: true } }),
      this.prisma.lightNovelReview.aggregate({
        _avg: { personalScore: true }
      })
    ]);

    const malScores = [
      averageAnimeMALScores._avg.score,
      averageMangaMALScores._avg.score,
      averageLightNovelMALScores._avg.score
    ];

    const personalScores = [
      averageAnimePersonalScores._avg.personalScore,
      averageMangaPersonalScores._avg.personalScore,
      averageLightNovelPersonalScores._avg.personalScore
    ];

    const validMalScores = malScores.filter(
      (score): score is number => score !== null
    );
    const averageMalScore =
      validMalScores.length > 0
        ? validMalScores.reduce((sum, score) => sum + score, 0) /
          validMalScores.length
        : 0;

    const validPersonalScores = personalScores.filter(
      (score): score is number => score !== null
    );
    const averagePersonalScore =
      validPersonalScores.length > 0
        ? validPersonalScores.reduce((sum, score) => sum + score, 0) /
          validPersonalScores.length
        : 0;

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
