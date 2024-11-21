import { LightNovel, Prisma, ProgressStatus } from "@prisma/client";
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

  private calculatePersonalScore(data: Prisma.LightNovelReviewUpdateInput) {
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
                    { volumesCount: { not: null } },
                    { review: { review: { not: null } } },
                    {
                      review: {
                        progressStatus: { not: ProgressStatus.DROPPED }
                      }
                    },
                    { volumeProgress: { every: { consumedAt: { not: null } } } }
                  ]
                }
              ]
            : filterStatusCheck === "incomplete"
              ? [
                  {
                    OR: [
                      { volumesCount: null },
                      { review: { review: null } },
                      { review: { progressStatus: ProgressStatus.DROPPED } },
                      { volumeProgress: { some: { consumedAt: null } } }
                    ]
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
          review: {
            select: {
              review: true,
              progressStatus: true,
              personalScore: true
            }
          },
          volumeProgress: { select: { volumeNumber: true, consumedAt: true } },
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
        volumeProgress: row.volumeProgress,
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

  async getLightNovelById(id: string) {
    try {
      const lightNovel = await prisma.lightNovel.findUnique({
        where: { id },
        include: {
          review: true,
          volumeProgress: true,
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

        const reviewRecords = await prisma.lightNovelReview.createManyAndReturn(
          {
            data: data.map(() => ({}))
          }
        );

        const lightNovelDataWithReviews = data.map((lightNovel, index) => ({
          ...lightNovel,
          reviewId: reviewRecords[index].id
        }));

        const createdLightNovelsRecords =
          await prisma.lightNovel.createManyAndReturn({
            data: lightNovelDataWithReviews.map(
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

        const createdLightNovelsMap = new Map<number, LightNovel>();
        createdLightNovelsRecords.forEach((record) => {
          createdLightNovelsMap.set(record.malId, record);
        });

        const lightNovelAuthorsData: Prisma.LightNovelAuthorsCreateManyInput[] =
          [];
        const lightNovelGenresData: Prisma.LightNovelGenresCreateManyInput[] =
          [];
        const lightNovelThemesData: Prisma.LightNovelThemesCreateManyInput[] =
          [];

        data.forEach((originalLightNovel) => {
          const createdRecord = createdLightNovelsMap.get(
            originalLightNovel.malId
          );
          if (createdRecord) {
            originalLightNovel.authors.forEach((name) => {
              const authorId = authorMap[name.toLowerCase()];
              if (authorId) {
                lightNovelAuthorsData.push({
                  lightNovelId: createdRecord.id,
                  authorId
                });
              }
            });

            originalLightNovel.genres.forEach((name) => {
              const genreId = genreMap[name.toLowerCase()];
              if (genreId) {
                lightNovelGenresData.push({
                  lightNovelId: createdRecord.id,
                  genreId
                });
              }
            });

            originalLightNovel.themes.forEach((name) => {
              const themeId = themeMap[name.toLowerCase()];
              if (themeId) {
                lightNovelThemesData.push({
                  lightNovelId: createdRecord.id,
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

        const lightNovelVolumesData: Prisma.LightNovelVolumesCreateManyInput[] =
          [];

        data.forEach((originalLightNovel) => {
          if (originalLightNovel.volumesCount != null) {
            const createdRecord = createdLightNovelsMap.get(
              originalLightNovel.malId
            );
            if (createdRecord) {
              for (let i = 1; i <= originalLightNovel.volumesCount; i++) {
                lightNovelVolumesData.push({
                  volumeNumber: i,
                  consumedAt: null,
                  lightNovelId: createdRecord.id
                });
              }
            }
          }
        });

        if (lightNovelVolumesData.length > 0) {
          await prisma.lightNovelVolumes.createMany({
            data: lightNovelVolumesData,
            skipDuplicates: true
          });
        }

        return createdLightNovelsRecords;
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
      return await prisma.$transaction(async (prisma) => {
        if (data.volumesCount !== undefined && data.volumesCount !== null) {
          const volumeCount = data.volumesCount as number;

          const currentCount = await prisma.lightNovelVolumes.count({
            where: { lightNovelId: id }
          });

          if (currentCount > volumeCount) {
            await prisma.lightNovelVolumes.deleteMany({
              where: { lightNovelId: id, volumeNumber: { gt: volumeCount } }
            });
          } else if (currentCount < volumeCount) {
            const volumesToAdd: Prisma.LightNovelVolumesCreateManyInput[] =
              Array.from({ length: volumeCount - currentCount }, (_, i) => ({
                volumeNumber: currentCount + i + 1,
                consumedAt: null,
                lightNovelId: id
              }));

            await prisma.lightNovelVolumes.createMany({
              data: volumesToAdd,
              skipDuplicates: true
            });
          }
        }

        return await prisma.lightNovel.update({ where: { id }, data });
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

  async updateLightNovelReview(
    id: string,
    data: Prisma.LightNovelReviewUpdateInput
  ) {
    try {
      return await prisma.lightNovel.update({
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
        throw new NotFoundError("Light novel not found!");
      }

      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new BadRequestError("Invalid request body!");
      }

      throw new InternalServerError((error as Error).message);
    }
  }

  async updateLightNovelVolumeProgress(
    data: { id: string; consumedAt?: Date | null }[]
  ) {
    try {
      return await prisma.$transaction(async (prisma) => {
        await Promise.all(
          data.map((record) => {
            return prisma.lightNovelVolumes.update({
              where: { id: record.id },
              data: { consumedAt: record.consumedAt }
            });
          })
        );
      });
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
