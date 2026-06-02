import { Injectable } from "@nestjs/common";

import { PrismaService } from "@/prisma/prisma.service";

import { Prisma } from "@prisma/client";

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

@Injectable()
export class StatisticTasteProfileService {
  constructor(private readonly prisma: PrismaService) {}

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
}
