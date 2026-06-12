import { BadRequestException, Injectable } from "@nestjs/common";

import { PrismaService } from "@/prisma/prisma.service";

import { StatisticsView } from "@/statistic/enums/statistics-view.enum";

import { Prisma } from "@prisma/client";

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
export class StatisticMediaConsumptionService {
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
}
