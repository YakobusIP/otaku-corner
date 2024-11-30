import { Prisma, ProgressStatus } from "@prisma/client";
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
    filterAuthor?: number,
    filterGenre?: number,
    filterTheme?: number,
    filterProgressStatus?: ProgressStatus,
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
          ...(filterProgressStatus
            ? [
                {
                  review: {
                    progressStatus: filterProgressStatus
                  }
                }
              ]
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
                    { review: { reviewText: { not: null } } },
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
                      { review: { reviewText: null } },
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
          slug: true,
          title: true,
          titleJapanese: true,
          images: true,
          status: true,
          score: true,
          review: {
            select: {
              reviewText: true,
              progressStatus: true,
              personalScore: true
            }
          },
          volumeProgress: { select: { volumeNumber: true, consumedAt: true } },
          volumesCount: true
        },
        orderBy: {
          title: sortBy === "title" ? sortOrder : undefined,
          score: sortBy === "score" ? sortOrder : undefined,
          ...(sortBy === "personal_score"
            ? {
                review: {
                  personalScore: { sort: sortOrder!, nulls: "last" }
                }
              }
            : {})
        },
        take: limitPerPage,
        skip: (currentPage - 1) * limitPerPage
      });

      const mappedData = data.map((item) => ({
        id: item.id,
        slug: item.slug,
        title: item.title,
        titleJapanese: item.titleJapanese,
        images: item.images,
        status: item.status,
        score: item.score,
        reviewText: item.review?.reviewText,
        progressStatus: item.review?.progressStatus,
        personalScore: item.review?.personalScore,
        volumeProgress: item.volumeProgress,
        volumesCount: item.volumesCount
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

  async getLightNovelById(id: number) {
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
        where: { id }
      });

      return !!lightNovel;
    } catch (error) {
      throw new InternalServerError((error as Error).message);
    }
  }

  async createLightNovelBulk(data: CustomLightNovelCreateInput[]) {
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
      const authorMap = new Map<string, number>();
      authors.forEach((author) => {
        authorMap.set(author.name.toLowerCase(), author.id);
      });
      const genreMap = new Map<string, number>();
      genres.forEach((genre) => {
        genreMap.set(genre.name.toLowerCase(), genre.id);
      });
      const themeMap = new Map<string, number>();
      themes.forEach((theme) => {
        themeMap.set(theme.name.toLowerCase(), theme.id);
      });

      const dataBatches = chunkArray(data, 5);

      for (const batch of dataBatches) {
        await prisma.$transaction(async (tx) => {
          const createLightNovelPromises = batch.map((ln) => {
            const authorsCreate = ln.authors.map((name) => ({
              authorId: authorMap.get(name.trim().toLowerCase())!
            }));

            const genresCreate = ln.genres.map((name) => ({
              genreId: genreMap.get(name.trim().toLowerCase())!
            }));

            const themesCreate = ln.themes.map((name) => ({
              themeId: themeMap.get(name.trim().toLowerCase())!
            }));

            const volumesData = ln.volumesCount
              ? Array.from({ length: ln.volumesCount }, (_, i) => ({
                  volumeNumber: i + 1,
                  consumedAt: null
                }))
              : [];

            return tx.lightNovel.create({
              data: {
                ...ln,
                authors: { createMany: { data: authorsCreate } },
                genres: { createMany: { data: genresCreate } },
                themes: { createMany: { data: themesCreate } },
                review: { create: {} },
                volumeProgress: { create: volumesData }
              }
            });
          });

          return await Promise.all(createLightNovelPromises);
        });
      }
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

  async updateLightNovel(id: number, data: Prisma.LightNovelUpdateInput) {
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
    id: number,
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
    data: { id: number; consumedAt?: Date | null }[]
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

  async deleteLightNovel(id: number) {
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

  async deleteMultipleLightNovels(ids: number[]) {
    try {
      return await prisma.lightNovel.deleteMany({ where: { id: { in: ids } } });
    } catch (error) {
      throw new InternalServerError((error as Error).message);
    }
  }

  async getTotalData() {
    try {
      return await prisma.lightNovel.count();
    } catch (error) {
      throw new InternalServerError((error as Error).message);
    }
  }

  async getSitemapData(page: number, limit: number) {
    try {
      const data = await prisma.lightNovel.findMany({
        select: {
          id: true,
          slug: true,
          review: {
            select: {
              createdAt: true,
              updatedAt: true
            }
          }
        },
        take: limit,
        skip: (page - 1) * limit
      });

      return data.map((item) => ({
        id: item.id,
        slug: item.slug,
        createdAt: item.review?.createdAt,
        updatedAt: item.review?.updatedAt
      }));
    } catch (error) {
      throw new InternalServerError((error as Error).message);
    }
  }
}
