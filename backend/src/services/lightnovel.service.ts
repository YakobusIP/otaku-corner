import { Prisma } from "@prisma/client";
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

type CustomLightNovelCreateInput = Omit<
  Prisma.LightNovelCreateInput,
  "authors" | "genres" | "themes"
> & {
  authors: string[];
  genres: string[];
  themes: string[];
};

export class LightNovelService {
  private static readonly scoringWeight = {
    storylineRating: 0.3,
    worldBuildingRating: 0.25,
    writingStyleRating: 0.2,
    charDevelopmentRating: 0.15,
    originalityRating: 0.1
  };

  constructor(
    private readonly authorService: AuthorService,
    private readonly genreService: GenreService,
    private readonly themeService: ThemeService
  ) {}

  private calculatePersonalScore(data: Prisma.LightNovelUpdateInput) {
    const {
      storylineRating,
      worldBuildingRating,
      writingStyleRating,
      charDevelopmentRating,
      originalityRating
    } = data;

    if (
      storylineRating &&
      worldBuildingRating &&
      writingStyleRating &&
      charDevelopmentRating &&
      originalityRating
    ) {
      const calculatedScore =
        (storylineRating as number) *
          LightNovelService.scoringWeight.storylineRating +
        (worldBuildingRating as number) *
          LightNovelService.scoringWeight.worldBuildingRating +
        (writingStyleRating as number) *
          LightNovelService.scoringWeight.writingStyleRating +
        (charDevelopmentRating as number) *
          LightNovelService.scoringWeight.charDevelopmentRating +
        (originalityRating as number) *
          LightNovelService.scoringWeight.originalityRating;

      return calculatedScore;
    }

    return null;
  }

  async getAllLightNovels(
    currentPage: number,
    limitPerPage: number,
    query?: string,
    sortBy?: string,
    sortOrder?: Prisma.SortOrder,
    filterAuthor?: string,
    filterGenre?: string,
    filterTheme?: string,
    filterMALScore?: string,
    filterPersonalScore?: string
  ) {
    try {
      const lowerCaseQuery = query && query.toLowerCase();
      const scoreRanges: Record<string, { min: number; max: number }> = {
        poor: { min: 1, max: 3.99 },
        average: { min: 4, max: 6.99 },
        good: { min: 7, max: 8.99 },
        excellent: { min: 9, max: 10 }
      };

      const filterCriteria: Prisma.LightNovelWhereInput = {
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
                  personalScore: {
                    gte: scoreRanges[filterPersonalScore].min,
                    lte: scoreRanges[filterPersonalScore].max
                  }
                }
              ]
            : [])
        ]
      };

      const itemCount = await prisma.lightNovel.count({
        where: filterCriteria
      });

      const pageCount = Math.ceil(itemCount / limitPerPage);

      const data = await prisma.lightNovel.findMany({
        where: filterCriteria,
        select: {
          id: true,
          title: true,
          titleJapanese: true,
          images: true,
          status: true,
          score: true,
          progressStatus: true,
          personalScore: true
        },
        orderBy: {
          title: sortBy === "title" ? sortOrder : undefined,
          score: sortBy === "score" ? sortOrder : undefined
        },
        take: limitPerPage,
        skip: (currentPage - 1) * limitPerPage
      });

      return {
        data,
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

  async getLightNovelById(id: string) {
    try {
      const lightNovel = await prisma.lightNovel.findUnique({
        where: { id },
        include: {
          authors: { select: { author: { select: { id: true, name: true } } } },
          genres: { select: { genre: { select: { id: true, name: true } } } },
          themes: { select: { theme: { select: { id: true, name: true } } } }
        }
      });

      if (!lightNovel) throw new NotFoundError("Light novel not found!");

      return lightNovel;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new InternalServerError((error as Error).message);
    }
  }

  async createLightNovel(data: CustomLightNovelCreateInput) {
    try {
      const authorIds = await Promise.all(
        data.authors.map(async (name) => {
          const author = await this.authorService.getOrCreateAuthor(name);
          return { authorId: author.id };
        })
      );
      const genreIds = await Promise.all(
        data.genres.map(async (name) => {
          const genre = await this.genreService.getOrCreateGenre(name);
          return { genreId: genre.id };
        })
      );
      const themeIds = await Promise.all(
        data.themes.map(async (name) => {
          const theme = await this.themeService.getOrCreateTheme(name);
          return { themeId: theme.id };
        })
      );

      const lightNovelData: Prisma.LightNovelCreateInput = {
        ...data,
        authors: {
          create: authorIds.map((author) => ({ authorId: author.authorId }))
        },
        genres: {
          create: genreIds.map((genre) => ({ genreId: genre.genreId }))
        },
        themes: {
          create: themeIds.map((theme) => ({ themeId: theme.themeId }))
        }
      };

      return await prisma.lightNovel.create({ data: lightNovelData });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new PrismaUniqueError("Light novel already exists!");
      }

      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new BadRequestError("Invalid request body!");
      }

      throw new InternalServerError((error as Error).message);
    }
  }

  async updateLightNovel(id: string, data: Prisma.LightNovelUpdateInput) {
    try {
      const lightNovelData = { ...data };
      lightNovelData.personalScore =
        this.calculatePersonalScore(lightNovelData);
      return await prisma.lightNovel.update({
        where: { id },
        data: lightNovelData
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new NotFoundError("Light novel not found!");
      }

      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new BadRequestError("Invalid request body!");
      }

      throw new InternalServerError((error as Error).message);
    }
  }

  async deleteLightNovel(id: string) {
    try {
      return await prisma.lightNovel.delete({ where: { id } });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new NotFoundError("Light novel not found!");
      }

      throw new InternalServerError((error as Error).message);
    }
  }

  async deleteMultipleLightNovels(ids: string[]) {
    try {
      return await prisma.lightNovel.deleteMany({ where: { id: { in: ids } } });
    } catch (error) {
      throw new InternalServerError((error as Error).message);
    }
  }
}
