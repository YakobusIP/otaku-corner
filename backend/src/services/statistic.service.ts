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
        FROM ${Prisma.raw(`"Anime"`)} WHERE "consumedAt" IS NOT NULL
        UNION ALL
        SELECT MIN(EXTRACT(YEAR FROM "consumedAt")) AS min_year,
               MAX(EXTRACT(YEAR FROM "consumedAt")) AS max_year
        FROM ${Prisma.raw(`"Manga"`)} WHERE "consumedAt" IS NOT NULL
        UNION ALL
        SELECT MIN(EXTRACT(YEAR FROM "consumedAt")) AS min_year,
               MAX(EXTRACT(YEAR FROM "consumedAt")) AS max_year
        FROM ${Prisma.raw(`"LightNovel"`)} WHERE "consumedAt" IS NOT NULL
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

      let whereClause: Prisma.Sql;
      if (year) {
        whereClause = Prisma.sql`WHERE EXTRACT(YEAR FROM "consumedAt") = ${year} AND "consumedAt" IS NOT NULL`;
      } else {
        whereClause = Prisma.sql`WHERE "consumedAt" IS NOT NULL`;
      }

      let selectPeriod: Prisma.Sql;
      let groupByClause: Prisma.Sql;
      let orderByClause: Prisma.Sql;

      if (view === STATISTICS_VIEW.YEARLY) {
        selectPeriod = Prisma.raw(`EXTRACT(YEAR FROM "consumedAt") AS period`);
        groupByClause = Prisma.raw(`period`);
        orderByClause = Prisma.raw(`period ASC`);
      } else {
        selectPeriod = Prisma.raw(`EXTRACT(MONTH FROM "consumedAt") AS period`);
        groupByClause = Prisma.raw(`period`);
        orderByClause = Prisma.raw(`period ASC`);
      }

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
        const query = Prisma.sql`
          SELECT ${selectPeriod}, COUNT(*)::INTEGER AS count
          FROM ${Prisma.raw(`"${table}"`)}
          ${whereClause}
          GROUP BY ${groupByClause}
          ORDER BY ${orderByClause}
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
        const animeRaw = await prisma.anime.groupBy({
          by: ["progressStatus"],
          _count: { progressStatus: true }
        });
        updateProgressMap(animeRaw);
      } else if (media === "manga") {
        const mangaRaw = await prisma.manga.groupBy({
          by: ["progressStatus"],
          _count: { progressStatus: true }
        });
        updateProgressMap(mangaRaw);
      } else if (media === "lightNovel") {
        const lightNovelRaw = await prisma.lightNovel.groupBy({
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
      const consumedAnimeCountPromise = await prisma.anime.count({
        where: { progressStatus: { in: ["COMPLETED", "DROPPED"] } }
      });
      const consumedMangaCountPromise = await prisma.manga.count({
        where: { progressStatus: { in: ["COMPLETED", "DROPPED"] } }
      });
      const consumedLightNovelCountPromise = await prisma.lightNovel.count({
        where: { progressStatus: { in: ["COMPLETED", "DROPPED"] } }
      });

      const averageAnimeScoresPromise = await prisma.anime.aggregate({
        _avg: { score: true, personalScore: true }
      });
      const averageMangaScoresPromise = await prisma.manga.aggregate({
        _avg: { score: true, personalScore: true }
      });
      const averageLightNovelScoresPromise = await prisma.lightNovel.aggregate({
        _avg: { score: true, personalScore: true }
      });

      const [
        consumedAnimeCount,
        consumedMangaCount,
        consumedLightNovelCount,
        averageAnimeScores,
        averageMangaScores,
        averageLightNovelScores
      ] = await Promise.all([
        consumedAnimeCountPromise,
        consumedMangaCountPromise,
        consumedLightNovelCountPromise,
        averageAnimeScoresPromise,
        averageMangaScoresPromise,
        averageLightNovelScoresPromise
      ]);

      const malScores = [
        averageAnimeScores._avg.score,
        averageMangaScores._avg.score,
        averageLightNovelScores._avg.score
      ];

      const personalScores = [
        averageAnimeScores._avg.personalScore,
        averageMangaScores._avg.personalScore,
        averageLightNovelScores._avg.personalScore
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
        where: { consumedAt: { gte: startDate, lte: endDate } }
      });

      const highestAnimePromise = prisma.anime.findMany({
        select: { images: true, personalScore: true, title: true },
        orderBy: { personalScore: "desc" },
        take: 1
      });

      const consumedMangaYearlyPromise = prisma.manga.count({
        where: { consumedAt: { gte: startDate, lte: endDate } }
      });

      const highestMangaPromise = prisma.manga.findMany({
        select: { images: true, personalScore: true, title: true },
        orderBy: { personalScore: "desc" },
        take: 1
      });

      const consumedLightNovelYearlyPromise = prisma.lightNovel.count({
        where: { consumedAt: { gte: startDate, lte: endDate } }
      });

      const highestLightNovelPromise = prisma.lightNovel.findMany({
        select: { images: true, personalScore: true, title: true },
        orderBy: { personalScore: "desc" },
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

      return {
        anime: {
          count: consumedAnimeYearlyCount,
          images: highestAnimeImage[0].images,
          title: highestAnimeImage[0].title,
          score: highestAnimeImage[0].personalScore
        },
        manga: {
          count: consumedMangaYearlyCount,
          images: highestMangaImage[0].images,
          title: highestMangaImage[0].title,
          score: highestMangaImage[0].personalScore
        },
        lightNovel: {
          count: consumedLightNovelYearlyCount,
          images: highestLightNovelImage[0].images,
          title: highestLightNovelImage[0].title,
          score: highestLightNovelImage[0].personalScore
        }
      };
    } catch (error) {
      throw new InternalServerError((error as Error).message);
    }
  };
}
