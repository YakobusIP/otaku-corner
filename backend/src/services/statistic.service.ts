import { prisma } from "../lib/prisma";
import { InternalServerError } from "../lib/error";
import { STATISTICS_VIEW } from "../enum/general.enum";
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

type RawMediaProgressData = {
  progressStatus: ProgressStatus;
  _count: {
    progressStatus: number;
  };
};

type MediaProgressMap = {
  status: string;
  count: number;
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

export class StatisticService {
  getYearRange = async () => {
    try {
      const years: number[] = [];
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

      const result = await prisma.$queryRaw<
        {
          min_year: number | null;
          max_year: number | null;
        }[]
      >(minMaxYearQuery);

      const minYear = result[0]?.min_year
        ? Math.floor(result[0].min_year)
        : new Date().getFullYear();
      const maxYear = result[0]?.max_year
        ? Math.floor(result[0].max_year)
        : new Date().getFullYear();

      for (let y = minYear; y <= maxYear; y++) {
        years.push(y);
      }

      return years;
    } catch (error) {
      throw new InternalServerError((error as Error).message);
    }
  };

  generateMediaConsumption = async (
    view = STATISTICS_VIEW.MONTHLY,
    year?: number
  ) => {
    try {
      const tables: ValidTable[] = ["Anime", "Manga", "LightNovel"];

      const tableConfig: Record<
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

      const months = [
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

      const getConsumptionStatistics = async (
        table: ValidTable
      ): Promise<Map<string, number>> => {
        const config = tableConfig[table];
        const { joinClause, consumedAtField } = config;

        let whereClause: Prisma.Sql;
        if (year) {
          whereClause = Prisma.sql`WHERE EXTRACT(YEAR FROM ${Prisma.raw(consumedAtField)}) = ${year} AND ${Prisma.raw(consumedAtField)} IS NOT NULL`;
        } else {
          whereClause = Prisma.sql`WHERE ${Prisma.raw(consumedAtField)} IS NOT NULL`;
        }

        let periodSelection: Prisma.Sql;
        if (view === STATISTICS_VIEW.YEARLY) {
          periodSelection = Prisma.sql`EXTRACT(YEAR FROM ${Prisma.raw(consumedAtField)}) AS period`;
        } else {
          periodSelection = Prisma.sql`EXTRACT(MONTH FROM ${Prisma.raw(consumedAtField)}) AS period`;
        }

        const query = Prisma.sql`
          SELECT ${periodSelection}, COUNT(*)::INTEGER AS count
          FROM ${Prisma.raw(`"${table}" core`)}
          INNER JOIN ${joinClause}
          ${whereClause}
          GROUP BY period
          ORDER BY period ASC
        `;

        const result = await prisma.$queryRaw<RawMediaConsumption[]>(query);

        const countsMap = new Map<string, number>();
        result.forEach((row) => {
          const periodKey =
            view === STATISTICS_VIEW.YEARLY
              ? row.period.toString()
              : months[Math.floor(Number(row.period) - 1)];
          countsMap.set(periodKey, row.count);
        });

        return countsMap;
      };

      const [animeCounts, mangaCounts, lightNovelCounts] = await Promise.all(
        tables.map((table) => getConsumptionStatistics(table))
      );

      const data: MediaConsumption[] = [];

      if (view === STATISTICS_VIEW.YEARLY) {
        const years = await this.getYearRange();
        for (const year of years) {
          const period = year.toString();
          data.push({
            period,
            animeCount: animeCounts.get(period) ?? 0,
            mangaCount: mangaCounts.get(period) ?? 0,
            lightNovelCount: lightNovelCounts.get(period) ?? 0
          });
        }
      } else {
        for (const period of months) {
          data.push({
            period,
            animeCount: animeCounts.get(period) ?? 0,
            mangaCount: mangaCounts.get(period) ?? 0,
            lightNovelCount: lightNovelCounts.get(period) ?? 0
          });
        }
      }

      return data;
    } catch (error) {
      throw new InternalServerError((error as Error).message);
    }
  };

  generateMediaProgress = async (media: "anime" | "manga" | "lightNovel") => {
    try {
      const allProgressStatus = Object.values(ProgressStatus);
      const progressMap = new Map<string, MediaProgressMap>();

      allProgressStatus.forEach((status) => {
        progressMap.set(status, {
          status,
          count: 0
        });
      });

      const updateProgressMap = (rawData: RawMediaProgressData[]) => {
        rawData.forEach((item) => {
          const status = item.progressStatus;
          const count = item._count.progressStatus;

          const currentData = progressMap.get(status)!;
          currentData.count = count;
        });
      };

      if (media === "anime") {
        const animeRaw = await prisma.animeReview.groupBy({
          by: ["progressStatus"],
          _count: { progressStatus: true }
        });
        updateProgressMap(animeRaw);
      } else if (media === "manga") {
        const mangaRaw = await prisma.mangaReview.groupBy({
          by: ["progressStatus"],
          _count: { progressStatus: true }
        });
        updateProgressMap(mangaRaw);
      } else if (media === "lightNovel") {
        const lightNovelRaw = await prisma.lightNovelReview.groupBy({
          by: ["progressStatus"],
          _count: { progressStatus: true }
        });
        updateProgressMap(lightNovelRaw);
      }

      const result = Array.from(progressMap.values());

      return result;
    } catch (error) {
      throw new InternalServerError((error as Error).message);
    }
  };

  generateGenreConsumption = async () => {
    try {
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
        LIMIT 5;
      `;
      const result = await prisma.$queryRaw<GenreConsumption[]>(query);

      return result;
    } catch (error) {
      throw new InternalServerError((error as Error).message);
    }
  };

  generateStudioConsumption = async () => {
    try {
      const query = Prisma.sql`
        SELECT 
          s.name, 
          COUNT(DISTINCT as2."animeId")::INTEGER AS "animeCount",
          COUNT(DISTINCT as2."animeId")::INTEGER AS "totalCount"
        FROM "Studio" s 
        LEFT JOIN "AnimeStudios" as2 ON s.id = as2."studioId" 
        GROUP BY s.name
        ORDER BY "totalCount" DESC
        LIMIT 5;
      `;

      const result = await prisma.$queryRaw<StudioConsumption[]>(query);

      return result;
    } catch (error) {
      throw new InternalServerError((error as Error).message);
    }
  };

  generateThemeConsumption = async () => {
    try {
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
        LIMIT 5;
      `;
      const result = await prisma.$queryRaw<ThemeConsumption[]>(query);

      return result;
    } catch (error) {
      throw new InternalServerError((error as Error).message);
    }
  };

  generateAuthorConsumption = async () => {
    try {
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
        LIMIT 5;
      `;
      const result = await prisma.$queryRaw<AuthorConsumption[]>(query);

      return result;
    } catch (error) {
      throw new InternalServerError((error as Error).message);
    }
  };

  getAllTimeStatistics = async () => {
    try {
      const consumedAnimeCountPromise = await prisma.animeReview.count({
        where: { progressStatus: { in: ["COMPLETED", "DROPPED"] } }
      });
      const consumedMangaCountPromise = await prisma.mangaReview.count({
        where: { progressStatus: { in: ["COMPLETED", "DROPPED"] } }
      });
      const consumedLightNovelCountPromise =
        await prisma.lightNovelReview.count({
          where: { progressStatus: { in: ["COMPLETED", "DROPPED"] } }
        });

      const averageAnimeMALScoresPromise = await prisma.anime.aggregate({
        _avg: { score: true }
      });
      const averageMangaMALScoresPromise = await prisma.manga.aggregate({
        _avg: { score: true }
      });
      const averageLightNovelMALScoresPromise =
        await prisma.lightNovel.aggregate({
          _avg: { score: true }
        });

      const averageAnimePersonalScoresPromise =
        await prisma.animeReview.aggregate({
          _avg: { personalScore: true }
        });
      const averageMangaPersonalScoresPromise =
        await prisma.mangaReview.aggregate({
          _avg: { personalScore: true }
        });
      const averageLightNovelPersonalScoresPromise =
        await prisma.lightNovelReview.aggregate({
          _avg: { personalScore: true }
        });

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
        consumedAnimeCountPromise,
        consumedMangaCountPromise,
        consumedLightNovelCountPromise,
        averageAnimeMALScoresPromise,
        averageMangaMALScoresPromise,
        averageLightNovelMALScoresPromise,
        averageAnimePersonalScoresPromise,
        averageMangaPersonalScoresPromise,
        averageLightNovelPersonalScoresPromise
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

      const validMalScores = malScores.filter((score) => score !== null);
      const averageMalScore =
        validMalScores.length > 0
          ? validMalScores.reduce((sum, score) => sum + score, 0) /
            validMalScores.length
          : 0;

      const validPersonalScores = personalScores.filter(
        (score) => score !== null
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
        averageMalScore: averageMalScore,
        averagePersonalScore: averagePersonalScore
      };
    } catch (error) {
      throw new InternalServerError((error as Error).message);
    }
  };

  getEachMediaTopScoreAndYearlyCount = async () => {
    try {
      const currentYear = new Date().getFullYear();
      const startDate = new Date(currentYear, 0, 1);
      const endDate = new Date(currentYear, 11, 31, 23, 59, 59, 9999);

      const consumedAnimeYearlyPromise = prisma.anime.count({
        where: { review: { consumedAt: { gte: startDate, lte: endDate } } }
      });

      const highestAnimePromise = prisma.anime.findMany({
        select: {
          images: true,
          title: true,
          review: { select: { personalScore: true } }
        },
        orderBy: { review: { personalScore: { sort: "asc", nulls: "last" } } },
        take: 1
      });

      const consumedMangaYearlyPromise = prisma.manga.count({
        where: { review: { consumedAt: { gte: startDate, lte: endDate } } }
      });

      const highestMangaPromise = prisma.manga.findMany({
        select: {
          images: true,
          title: true,
          review: { select: { personalScore: true } }
        },
        orderBy: { review: { personalScore: { sort: "asc", nulls: "last" } } },
        take: 1
      });

      const consumedLightNovelYearlyPromise = prisma.lightNovelVolumes.count({
        where: { consumedAt: { gte: startDate, lte: endDate } }
      });

      const highestLightNovelPromise = prisma.lightNovel.findMany({
        select: {
          images: true,
          title: true,
          review: { select: { personalScore: true } }
        },
        orderBy: { review: { personalScore: { sort: "asc", nulls: "last" } } },
        take: 1
      });

      const [
        consumedAnimeYearlyCount,
        highestAnimeImage,
        consumedMangaYearlyCount,
        highestMangaImage,
        consumedLightNovelYearlyCount,
        highestLightNovelImage
      ] = await Promise.all([
        consumedAnimeYearlyPromise,
        highestAnimePromise,
        consumedMangaYearlyPromise,
        highestMangaPromise,
        consumedLightNovelYearlyPromise,
        highestLightNovelPromise
      ]);

      const prepareResults = (
        count: number,
        highestImages: {
          review: {
            personalScore: number | null;
          } | null;
          title: string;
          images: Prisma.JsonValue;
        }[]
      ) => {
        return {
          count,
          images: highestImages.length > 0 ? highestImages[0].images : null,
          title: highestImages.length > 0 ? highestImages[0].title : null,
          score:
            highestImages.length > 0
              ? highestImages[0].review?.personalScore
              : null
        };
      };

      return {
        anime: prepareResults(consumedAnimeYearlyCount, highestAnimeImage),
        manga: prepareResults(consumedMangaYearlyCount, highestMangaImage),
        lightNovel: prepareResults(
          consumedLightNovelYearlyCount,
          highestLightNovelImage
        )
      };
    } catch (error) {
      throw new InternalServerError((error as Error).message);
    }
  };
}
