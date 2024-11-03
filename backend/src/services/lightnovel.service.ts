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

      const authorNames = lightNovel.authors.map((a) => ({
        id: a.author.id,
        name: a.author.name
      }));
      const genreNames = lightNovel.genres.map((g) => ({
        id: g.genre.id,
        name: g.genre.name
      }));
      const themeNames = lightNovel.themes.map((t) => ({
        id: t.theme.id,
        name: t.theme.name
      }));

      return {
        ...lightNovel,
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

  async getLightNovelDuplicate(id: number) {
    try {
      const lightNovel = await prisma.lightNovel.findUnique({
        where: { malId: id }
      });

      return !!lightNovel;
    } catch (error) {
      throw new InternalServerError((error as Error).message);
    }
  }

  async createLightNovelBulk(data: CustomLightNovelCreateInput[]) {
    try {
      const createdLightNovels = await prisma.$transaction(async (prisma) => {
        const allAuthors = Array.from(
          new Set(
            data.flatMap((lightNovel) =>
              lightNovel.authors.map((s) => s.trim())
            )
          )
        );
        const allGenres = Array.from(
          new Set(
            data.flatMap((lightNovel) => lightNovel.genres.map((g) => g.trim()))
          )
        );
        const allThemes = Array.from(
          new Set(
            data.flatMap((lightNovel) => lightNovel.themes.map((t) => t.trim()))
          )
        );

        const [authors, genres, themes] = await Promise.all([
          Promise.all(
            allAuthors.map((name) => this.authorService.getOrCreateAuthor(name))
          ),
          Promise.all(
            allGenres.map((name) => this.genreService.getOrCreateGenre(name))
          ),
          Promise.all(
            allThemes.map((name) => this.themeService.getOrCreateTheme(name))
          )
        ]);

        const authorMap: Record<string, string> = {};
        authors.forEach((author) => {
          authorMap[author.name.toLowerCase()] = author.id;
        });

        const genreMap: Record<string, string> = {};
        genres.forEach((genre) => {
          genreMap[genre.name.toLowerCase()] = genre.id;
        });

        const themeMap: Record<string, string> = {};
        themes.forEach((theme) => {
          themeMap[theme.name.toLowerCase()] = theme.id;
        });

        const createdLightNovels = await prisma.lightNovel.createManyAndReturn({
          data: data.map(
            ({
              authors: _authors,
              genres: _genres,
              themes: _themes,
              ...lightNovel
            }) => ({
              ...lightNovel
            })
          ),
          skipDuplicates: true
        });

        const lightNovelAuthorsData: Prisma.LightNovelAuthorsCreateManyInput[] =
          [];
        const lightNovelGenresData: Prisma.LightNovelGenresCreateManyInput[] =
          [];
        const lightNovelThemesData: Prisma.LightNovelThemesCreateManyInput[] =
          [];

        createdLightNovels.forEach((record) => {
          const originalLightNovel = data.find((a) => a.malId === record.malId);
          if (originalLightNovel) {
            originalLightNovel.authors.forEach((name) => {
              const authorId = authorMap[name.toLowerCase()];
              if (authorId) {
                lightNovelAuthorsData.push({
                  lightNovelId: record.id,
                  authorId
                });
              }
            });

            originalLightNovel.genres.forEach((name) => {
              const genreId = genreMap[name.toLowerCase()];
              if (genreId) {
                lightNovelGenresData.push({
                  lightNovelId: record.id,
                  genreId
                });
              }
            });

            originalLightNovel.themes.forEach((name) => {
              const themeId = themeMap[name.toLowerCase()];
              if (themeId) {
                lightNovelThemesData.push({
                  lightNovelId: record.id,
                  themeId
                });
              }
            });
          }
        });

        await Promise.all([
          prisma.lightNovelAuthors.createMany({
            data: lightNovelAuthorsData,
            skipDuplicates: true
          }),
          prisma.lightNovelGenres.createMany({
            data: lightNovelGenresData,
            skipDuplicates: true
          }),
          prisma.lightNovelThemes.createMany({
            data: lightNovelThemesData,
            skipDuplicates: true
          })
        ]);

        return createdLightNovels;
      });

      return createdLightNovels;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new PrismaUniqueError(
          "One or more light novel records already exist!"
        );
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
