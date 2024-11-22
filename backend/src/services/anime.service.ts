import { Anime, Prisma } from "@prisma/client";
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
import { chunkArray } from "../lib/utils";

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

  private calculatePersonalScore(data: Prisma.AnimeReviewUpdateInput) {
    const {
      storylineRating,
      qualityRating,
      voiceActingRating,
      soundTrackRating,
      charDevelopmentRating
    } = data;

    if (
      storylineRating &&
      qualityRating &&
      voiceActingRating &&
      soundTrackRating &&
      charDevelopmentRating
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
    filterType?: string,
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
          ...(filterGenre
            ? [{ genres: { some: { genreId: filterGenre } } }]
            : []),
          ...(filterStudio
            ? [{ studios: { some: { studioId: filterStudio } } }]
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
          ...(filterType ? [{ type: { equals: filterType } }] : []),
          ...(filterStatusCheck === "complete"
            ? [
                {
                  AND: [
                    {
                      OR: [
                        { type: { in: ["Movie", "OVA"] } },
                        {
                          AND: [
                            { type: { notIn: ["Movie", "OVA"] } },
                            { episodes: { some: {} } }
                          ]
                        }
                      ]
                    },
                    { review: { review: { not: null } } },
                    { review: { consumedAt: { not: null } } }
                  ]
                }
              ]
            : filterStatusCheck === "incomplete"
              ? [
                  {
                    OR: [
                      {
                        AND: [
                          { type: { notIn: ["Movie", "OVA"] } },
                          { episodes: { none: {} } }
                        ]
                      },
                      { review: { review: null } },
                      { review: { consumedAt: null } }
                    ]
                  }
                ]
              : [])
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
          review: {
            select: {
              review: true,
              progressStatus: true,
              personalScore: true,
              consumedAt: true
            }
          },
          _count: {
            select: {
              episodes: true
            }
          }
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
        type: row.type,
        score: row.score,
        rating: row.rating,
        review: row.review?.review,
        progressStatus: row.review?.progressStatus,
        personalScore: row.review?.personalScore,
        consumedAt: row.review?.consumedAt,
        fetchedEpisode: row._count.episodes
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

  async getAnimeById(id: string) {
    try {
      const anime = await prisma.anime.findUnique({
        where: { id },
        include: {
          review: true,
          genres: { select: { genre: { select: { id: true, name: true } } } },
          studios: { select: { studio: { select: { id: true, name: true } } } },
          themes: { select: { theme: { select: { id: true, name: true } } } },
          episodes: { orderBy: { number: "asc" } }
        }
      });

      if (!anime) throw new NotFoundError("Anime not found!");

      const genreNames = anime.genres.map((g) => ({
        id: g.genre.id,
        name: g.genre.name
      }));
      const studioNames = anime.studios.map((s) => ({
        id: s.studio.id,
        name: s.studio.name
      }));
      const themeNames = anime.themes.map((t) => ({
        id: t.theme.id,
        name: t.theme.name
      }));

      return {
        ...anime,
        genres: genreNames,
        studios: studioNames,
        themes: themeNames
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new InternalServerError((error as Error).message);
    }
  }

  async getAnimeDuplicate(id: number) {
    try {
      const anime = await prisma.anime.findUnique({
        where: { malId: id }
      });

      return !!anime;
    } catch (error) {
      throw new InternalServerError((error as Error).message);
    }
  }

  async createAnimeBulk(data: CustomAnimeCreateInput[]) {
    try {
      // Extract unique genres, studios, themes
      const allGenres = [
        ...new Set(data.flatMap((ln) => ln.genres.map((name) => name.trim())))
      ];
      const allStudios = [
        ...new Set(data.flatMap((ln) => ln.studios.map((name) => name.trim())))
      ];
      const allThemes = [
        ...new Set(data.flatMap((ln) => ln.themes.map((name) => name.trim())))
      ];

      // Get or create genres, studios, themes
      const [genres, studios, themes] = await Promise.all([
        this.genreService.getOrCreateGenres(allGenres),
        this.studioService.getOrCreateStudios(allStudios),
        this.themeService.getOrCreateThemes(allThemes)
      ]);

      // Create maps for quick ID lookup
      const genreMap = new Map<string, string>();
      genres.forEach((genre) => {
        genreMap.set(genre.name.toLowerCase(), genre.id);
      });
      const studioMap = new Map<string, string>();
      studios.forEach((studio) => {
        studioMap.set(studio.name.toLowerCase(), studio.id);
      });
      const themeMap = new Map<string, string>();
      themes.forEach((theme) => {
        themeMap.set(theme.name.toLowerCase(), theme.id);
      });

      const dataBatches = chunkArray(data, 5);
      const createdAnimeRecords: Anime[] = [];

      for (const batch of dataBatches) {
        await prisma.$transaction(async (tx) => {
          const createAnimePromises = batch.map((anime) => {
            const genresCreate = anime.genres.map((name) => ({
              genreId: genreMap.get(name.trim().toLowerCase())!
            }));

            const studiosCreate = anime.studios.map((name) => ({
              studioId: studioMap.get(name.trim().toLowerCase())!
            }));

            const themesCreate = anime.themes.map((name) => ({
              themeId: themeMap.get(name.trim().toLowerCase())!
            }));

            return tx.anime.create({
              data: {
                ...anime,
                genres: { createMany: { data: genresCreate } },
                studios: { createMany: { data: studiosCreate } },
                themes: { createMany: { data: themesCreate } },
                review: { create: {} },
                episodes: {}
              }
            });
          });

          const result = await Promise.all(createAnimePromises);
          createdAnimeRecords.push(...result);
        });
      }

      return createdAnimeRecords;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new PrismaUniqueError("One or more anime records already exist!");
      }

      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new BadRequestError("Invalid request body!");
      }

      throw new InternalServerError((error as Error).message);
    }
  }

  async addAnimeEpisodes(episodes: Prisma.AnimeEpisodeCreateManyInput[]) {
    try {
      return await prisma.animeEpisode.createMany({
        data: episodes,
        skipDuplicates: true
      });
    } catch (error) {
      throw new InternalServerError((error as Error).message);
    }
  }

  async updateAnime(id: string, data: Prisma.AnimeUpdateInput) {
    try {
      return await prisma.anime.update({ where: { id }, data });
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

  async updateAnimeReview(id: string, data: Prisma.AnimeReviewUpdateInput) {
    try {
      return await prisma.anime.update({
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
