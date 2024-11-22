import { Manga, Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { AuthorService } from "./author.service";
import { GenreService } from "./genre.service";
import { ThemeService } from "./theme.service";
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
  PrismaUniqueError
} from "../lib/error";
import { chunkArray } from "../lib/utils";

type CustomMangaCreateInput = Omit<
  Prisma.MangaCreateInput,
  "authors" | "genres" | "themes"
> & {
  authors: string[];
  genres: string[];
  themes: string[];
};

export class MangaService {
  private static readonly scoringWeight = {
    storylineRating: 0.3,
    artStyleRating: 0.25,
    charDevelopmentRating: 0.2,
    worldBuildingRating: 0.15,
    originalityRating: 0.1
  };

  constructor(
    private readonly authorService: AuthorService,
    private readonly genreService: GenreService,
    private readonly themeService: ThemeService
  ) {}

  private calculatePersonalScore(data: Prisma.MangaReviewUpdateInput) {
    const {
      storylineRating,
      artStyleRating,
      charDevelopmentRating,
      worldBuildingRating,
      originalityRating
    } = data;

    if (
      storylineRating &&
      artStyleRating &&
      charDevelopmentRating &&
      worldBuildingRating &&
      originalityRating
    ) {
      const calculatedScore =
        (storylineRating as number) *
          MangaService.scoringWeight.storylineRating +
        (artStyleRating as number) * MangaService.scoringWeight.artStyleRating +
        (charDevelopmentRating as number) *
          MangaService.scoringWeight.charDevelopmentRating +
        (worldBuildingRating as number) *
          MangaService.scoringWeight.worldBuildingRating +
        (originalityRating as number) *
          MangaService.scoringWeight.originalityRating;

      return calculatedScore;
    }

    return null;
  }

  async getAllMangas(
    currentPage: number,
    limitPerPage: number,
    query?: string,
    sortBy?: string,
    sortOrder?: Prisma.SortOrder,
    filterAuthor?: string,
    filterGenre?: string,
    filterTheme?: string,
    filterMALScore?: string,
    filterPersonalScore?: string,
    filterStatusCheck?: string
  ) {
    try {
      const lowerCaseQuery = query && query.toLowerCase();
      const scoreRanges: Record<string, { min: number; max: number }> = {
        poor: { min: 1, max: 3.99 },
        average: { min: 4, max: 6.99 },
        good: { min: 7, max: 8.99 },
        excellent: { min: 9, max: 10 }
      };

      const filterCriteria: Prisma.MangaWhereInput = {
        AND: [
          {
            OR: [
              {
                title: {
                  contains: lowerCaseQuery,
                  mode: "insensitive"
                }
              },
              {
                titleSynonyms: {
                  contains: lowerCaseQuery,
                  mode: "insensitive"
                }
              }
            ]
          },
          ...(filterAuthor
            ? [{ authors: { some: { authorId: filterAuthor } } }]
            : []),
          ...(filterGenre
            ? [{ genres: { some: { genreId: filterGenre } } }]
            : []),
          ...(filterTheme
            ? [{ themes: { some: { themeId: filterTheme } } }]
            : []),
          ...(filterMALScore
            ? [
                {
                  score: {
                    gte: scoreRanges[filterMALScore].min,
                    lte: scoreRanges[filterMALScore].max
                  }
                }
              ]
            : []),
          ...(filterPersonalScore
            ? [
                {
                  review: {
                    personalScore: {
                      gte: scoreRanges[filterPersonalScore].min,
                      lte: scoreRanges[filterPersonalScore].max
                    }
                  }
                }
              ]
            : []),
          ...(filterStatusCheck === "complete"
            ? [
                {
                  AND: [
                    { chaptersCount: { not: null } },
                    { volumesCount: { not: null } },
                    { review: { review: { not: null } } },
                    { review: { consumedAt: { not: null } } }
                  ]
                }
              ]
            : filterStatusCheck === "incomplete"
              ? [
                  {
                    OR: [
                      { chaptersCount: null },
                      { volumesCount: null },
                      { review: { review: null } },
                      { review: { consumedAt: null } }
                    ]
                  }
                ]
              : [])
        ]
      };

      const itemCount = await prisma.manga.count({
        where: filterCriteria
      });

      const pageCount = Math.ceil(itemCount / limitPerPage);

      const data = await prisma.manga.findMany({
        where: filterCriteria,
        select: {
          id: true,
          title: true,
          titleJapanese: true,
          images: true,
          status: true,
          score: true,
          review: {
            select: {
              review: true,
              progressStatus: true,
              personalScore: true,
              consumedAt: true
            }
          },
          chaptersCount: true,
          volumesCount: true
        },
        orderBy: {
          title: sortBy === "title" ? sortOrder : undefined,
          score: sortBy === "score" ? sortOrder : undefined
        },
        take: limitPerPage,
        skip: (currentPage - 1) * limitPerPage
      });

      const mappedData = data.map((row) => ({
        id: row.id,
        title: row.title,
        titleJapanese: row.titleJapanese,
        images: row.images,
        status: row.status,
        score: row.score,
        review: row.review?.review,
        progressStatus: row.review?.progressStatus,
        personalScore: row.review?.personalScore,
        consumedAt: row.review?.consumedAt,
        chaptersCount: row.chaptersCount,
        volumesCount: row.volumesCount
      }));

      return {
        data: mappedData,
        metadata: {
          currentPage,
          limitPerPage,
          pageCount,
          itemCount
        }
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new BadRequestError("Invalid request parameters!");
      }

      throw new InternalServerError((error as Error).message);
    }
  }

  async getMangaById(id: string) {
    try {
      const manga = await prisma.manga.findUnique({
        where: { id },
        include: {
          review: true,
          authors: { select: { author: { select: { id: true, name: true } } } },
          genres: { select: { genre: { select: { id: true, name: true } } } },
          themes: { select: { theme: { select: { id: true, name: true } } } }
        }
      });

      if (!manga) throw new NotFoundError("Manga not found!");

      const authorNames = manga.authors.map((a) => ({
        id: a.author.id,
        name: a.author.name
      }));
      const genreNames = manga.genres.map((g) => ({
        id: g.genre.id,
        name: g.genre.name
      }));
      const themeNames = manga.themes.map((t) => ({
        id: t.theme.id,
        name: t.theme.name
      }));

      return {
        ...manga,
        authors: authorNames,
        genres: genreNames,
        themes: themeNames
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new InternalServerError((error as Error).message);
    }
  }

  async getMangaDuplicate(id: number) {
    try {
      const manga = await prisma.manga.findUnique({
        where: { malId: id }
      });

      return !!manga;
    } catch (error) {
      throw new InternalServerError((error as Error).message);
    }
  }

  async createMangaBulk(data: CustomMangaCreateInput[]) {
    try {
      // Extract unique authors, genres, themes
      const allAuthors = [
        ...new Set(data.flatMap((ln) => ln.authors.map((name) => name.trim())))
      ];
      const allGenres = [
        ...new Set(data.flatMap((ln) => ln.genres.map((name) => name.trim())))
      ];
      const allThemes = [
        ...new Set(data.flatMap((ln) => ln.themes.map((name) => name.trim())))
      ];

      // Get or create authors, genres, themes
      const [authors, genres, themes] = await Promise.all([
        this.authorService.getOrCreateAuthors(allAuthors),
        this.genreService.getOrCreateGenres(allGenres),
        this.themeService.getOrCreateThemes(allThemes)
      ]);

      // Create maps for quick ID lookup
      const authorMap = new Map<string, string>();
      authors.forEach((author) => {
        authorMap.set(author.name.toLowerCase(), author.id);
      });
      const genreMap = new Map<string, string>();
      genres.forEach((genre) => {
        genreMap.set(genre.name.toLowerCase(), genre.id);
      });
      const themeMap = new Map<string, string>();
      themes.forEach((theme) => {
        themeMap.set(theme.name.toLowerCase(), theme.id);
      });

      const dataBatches = chunkArray(data, 5);
      const createdMangaRecords: Manga[] = [];

      for (const batch of dataBatches) {
        await prisma.$transaction(async (tx) => {
          const createMangaPromises = batch.map((ln) => {
            const authorsCreate = ln.authors.map((name) => ({
              authorId: authorMap.get(name.trim().toLowerCase())!
            }));

            const genresCreate = ln.genres.map((name) => ({
              genreId: genreMap.get(name.trim().toLowerCase())!
            }));

            const themesCreate = ln.themes.map((name) => ({
              themeId: themeMap.get(name.trim().toLowerCase())!
            }));

            return tx.manga.create({
              data: {
                ...ln,
                authors: { createMany: { data: authorsCreate } },
                genres: { createMany: { data: genresCreate } },
                themes: { createMany: { data: themesCreate } },
                review: { create: {} }
              }
            });
          });

          const result = await Promise.all(createMangaPromises);
          createdMangaRecords.push(...result);
        });
      }

      return createdMangaRecords;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new PrismaUniqueError("One or more manga records already exist!");
      }

      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new BadRequestError("Invalid request body!");
      }

      throw new InternalServerError((error as Error).message);
    }
  }

  async updateManga(id: string, data: Prisma.MangaUpdateInput) {
    try {
      return await prisma.manga.update({ where: { id }, data });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new NotFoundError("Manga not found!");
      }

      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new BadRequestError("Invalid request body!");
      }

      throw new InternalServerError((error as Error).message);
    }
  }

  async updateMangaReview(id: string, data: Prisma.MangaReviewUpdateInput) {
    try {
      return await prisma.manga.update({
        where: { id },
        data: {
          review: {
            update: {
              ...data,
              personalScore: this.calculatePersonalScore(data)
            }
          }
        }
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new NotFoundError("Manga not found!");
      }

      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new BadRequestError("Invalid request body!");
      }

      throw new InternalServerError((error as Error).message);
    }
  }

  async deleteManga(id: string) {
    try {
      return await prisma.manga.delete({ where: { id } });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new NotFoundError("Manga not found!");
      }

      throw new InternalServerError((error as Error).message);
    }
  }

  async deleteMultipleMangas(ids: string[]) {
    try {
      return await prisma.manga.deleteMany({ where: { id: { in: ids } } });
    } catch (error) {
      throw new InternalServerError((error as Error).message);
    }
  }
}
