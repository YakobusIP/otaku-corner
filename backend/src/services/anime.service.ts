import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { GenreService } from "./genre.service";
import { StudioService } from "./studio.service";
import { ThemeService } from "./theme.service";
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
  PrismaUniqueError
} from "../lib/error";

type CustomAnimeCreateInput = Omit<
  Prisma.AnimeCreateInput,
  "episodes" | "genres" | "studios" | "themes"
> & {
  episodes: {
    aired: string;
    number: number;
    title: string;
    titleJapanese?: string;
    titleRomaji?: string;
  }[];
  genres: string[];
  studios: string[];
  themes: string[];
};

export class AnimeService {
  private static readonly scoringWeight = {
    storylineRating: 0.3,
    qualityRating: 0.25,
    voiceActingRating: 0.2,
    soundTrackRating: 0.15,
    charDevelopmentRating: 0.1
  };

  constructor(
    private readonly genreService: GenreService,
    private readonly studioService: StudioService,
    private readonly themeService: ThemeService
  ) {}

  private calculatePersonalScore(data: Prisma.AnimeUpdateInput) {
    const {
      storylineRating,
      qualityRating,
      voiceActingRating,
      soundTrackRating,
      charDevelopmentRating,
      personalScore
    } = data;

    if (
      storylineRating &&
      qualityRating &&
      voiceActingRating &&
      soundTrackRating &&
      charDevelopmentRating &&
      personalScore
    ) {
      const calculatedScore =
        (storylineRating as number) *
          AnimeService.scoringWeight.storylineRating +
        (qualityRating as number) * AnimeService.scoringWeight.qualityRating +
        (voiceActingRating as number) *
          AnimeService.scoringWeight.voiceActingRating +
        (soundTrackRating as number) *
          AnimeService.scoringWeight.soundTrackRating +
        (charDevelopmentRating as number) *
          AnimeService.scoringWeight.charDevelopmentRating;

      return calculatedScore;
    }

    return null;
  }

  async getAllAnimes(
    currentPage: number,
    limitPerPage: number,
    query?: string,
    sortBy?: string,
    sortOrder?: Prisma.SortOrder,
    filterGenre?: string,
    filterStudio?: string,
    filterTheme?: string,
    filterMALScore?: string,
    filterPersonalScore?: string,
    filterType?: string
  ) {
    try {
      const lowerCaseQuery = query && query.toLowerCase();
      const scoreRanges: Record<string, { min: number; max: number }> = {
        poor: { min: 1, max: 3.99 },
        average: { min: 4, max: 6.99 },
        good: { min: 7, max: 8.99 },
        excellent: { min: 9, max: 10 }
      };

      const filterCriteria: Prisma.AnimeWhereInput = {
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
          ...(filterGenre ? [{ genres: { some: { id: filterGenre } } }] : []),
          ...(filterStudio
            ? [{ studios: { some: { id: filterStudio } } }]
            : []),
          ...(filterTheme ? [{ themes: { some: { id: filterTheme } } }] : []),
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
            : []),
          ...(filterType ? [{ type: { equals: filterType } }] : [])
        ]
      };

      const itemCount = await prisma.anime.count({
        where: filterCriteria
      });

      const pageCount = Math.ceil(itemCount / limitPerPage);

      const data = await prisma.anime.findMany({
        where: filterCriteria,
        select: {
          id: true,
          title: true,
          titleJapanese: true,
          images: true,
          status: true,
          type: true,
          score: true,
          rating: true,
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

  async getAnimeById(id: string) {
    try {
      const anime = await prisma.anime.findUnique({
        where: { id },
        include: {
          genres: { select: { id: true, name: true } },
          studios: { select: { id: true, name: true } },
          themes: { select: { id: true, name: true } },
          episodes: { orderBy: { number: "asc" } }
        }
      });

      if (!anime) throw new NotFoundError("Anime not found!");

      return anime;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new InternalServerError((error as Error).message);
    }
  }

  async createAnime(data: CustomAnimeCreateInput) {
    try {
      const genreIds = await Promise.all(
        data.genres.map(async (name) => {
          const id = await this.genreService.getOrCreateGenre(name);
          return { id } as Prisma.GenreWhereUniqueInput;
        })
      );
      const studioIds = await Promise.all(
        data.studios.map(async (name) => {
          const id = await this.studioService.getOrCreateStudio(name);
          return { id } as Prisma.StudioWhereUniqueInput;
        })
      );
      const themeIds = await Promise.all(
        data.themes.map(async (name) => {
          const id = await this.themeService.getOrCreateTheme(name);
          return { id } as Prisma.ThemeWhereUniqueInput;
        })
      );

      const animeData: Prisma.AnimeCreateInput = {
        ...data,
        genres: { connect: genreIds },
        studios: { connect: studioIds },
        themes: { connect: themeIds },
        episodes: undefined
      };

      if (data.episodes && data.episodes.length > 0) {
        return await prisma.anime.create({
          data: {
            ...animeData,
            episodes: { createMany: { data: data.episodes } }
          }
        });
      } else {
        return await prisma.anime.create({ data: animeData });
      }
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new PrismaUniqueError("Anime already exists!");
      }

      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new BadRequestError("Invalid request body!");
      }

      throw new InternalServerError((error as Error).message);
    }
  }

  async updateAnime(id: string, data: Prisma.AnimeUpdateInput) {
    try {
      const animeData = { ...data };
      animeData.personalScore = this.calculatePersonalScore(animeData);
      return await prisma.anime.update({ where: { id }, data: animeData });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new NotFoundError("Anime not found!");
      }

      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new BadRequestError("Invalid request body!");
      }

      throw new InternalServerError((error as Error).message);
    }
  }

  async deleteAnime(id: string) {
    try {
      return await prisma.anime.delete({ where: { id } });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new NotFoundError("Anime not found!");
      }

      throw new InternalServerError((error as Error).message);
    }
  }

  async deleteMultipleAnimes(ids: string[]) {
    try {
      return await prisma.anime.deleteMany({ where: { id: { in: ids } } });
    } catch (error) {
      throw new InternalServerError((error as Error).message);
    }
  }
}
