import { Anime, Prisma, ProgressStatus } from "@prisma/client";
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

  private static readonly progressStatuses: Record<string, string> = {
    COMPLETED: "Completed",
    ON_PROGRESS: "On Progress",
    ON_HOLD: "On Hold",
    PLANNED: "Planned",
    DROPPED: "Dropped"
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
    page: number,
    limit: number,
    query?: string,
    sort?: string,
    order?: Prisma.SortOrder,
    genre?: number,
    studio?: number,
    theme?: number,
    status?: ProgressStatus,
    mal_score?: string,
    personal_score?: string,
    type?: string,
    status_check?: string
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
          ...(genre ? [{ genres: { some: { genreId: genre } } }] : []),
          ...(studio ? [{ studios: { some: { studioId: studio } } }] : []),
          ...(theme ? [{ themes: { some: { themeId: theme } } }] : []),
          ...(status
            ? [
                {
                  review: {
                    progressStatus: status
                  }
                }
              ]
            : []),
          ...(mal_score
            ? [
                {
                  score: {
                    gte: scoreRanges[mal_score].min,
                    lte: scoreRanges[mal_score].max
                  }
                }
              ]
            : []),
          ...(personal_score
            ? [
                {
                  review: {
                    personalScore: {
                      gte: scoreRanges[personal_score].min,
                      lte: scoreRanges[personal_score].max
                    }
                  }
                }
              ]
            : []),
          ...(type ? [{ type: { equals: type } }] : []),
          ...(status_check === "complete"
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
                    { review: { reviewText: { not: null } } },
                    { review: { consumedAt: { not: null } } }
                  ]
                }
              ]
            : status_check === "incomplete"
              ? [
                  {
                    OR: [
                      {
                        AND: [
                          { type: { notIn: ["Movie", "OVA"] } },
                          { episodes: { none: {} } }
                        ]
                      },
                      { review: { reviewText: null } },
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

      const pageCount = Math.ceil(itemCount / limit);

      const data = await prisma.anime.findMany({
        where: filterCriteria,
        select: {
          id: true,
          slug: true,
          title: true,
          titleJapanese: true,
          images: true,
          status: true,
          type: true,
          score: true,
          rating: true,
          season: true,
          aired: true,
          review: {
            select: {
              reviewText: true,
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
          title: sort === "title" ? order : undefined,
          score: sort === "score" ? order : undefined,
          ...(sort === "personal_score"
            ? {
                review: {
                  personalScore: { sort: order!, nulls: "last" }
                }
              }
            : {})
        },
        take: limit,
        skip: (page - 1) * limit
      });

      const mappedData = data.map((item) => ({
        id: item.id,
        slug: item.slug,
        title: item.title,
        titleJapanese: item.titleJapanese,
        images: item.images,
        status: item.status,
        type: item.type,
        score: item.score,
        season: item.season,
        aired: item.aired,
        rating: item.rating,
        reviewText: item.review?.reviewText,
        progressStatus: item.review?.progressStatus,
        personalScore: item.review?.personalScore,
        consumedAt: item.review?.consumedAt,
        fetchedEpisode: item._count.episodes
      }));

      return {
        data: mappedData,
        metadata: {
          page,
          limit,
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

  async getAnimeById(id: number) {
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
        where: { id }
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
      const genreMap = new Map<string, number>();
      genres.forEach((genre) => {
        genreMap.set(genre.name.toLowerCase(), genre.id);
      });
      const studioMap = new Map<string, number>();
      studios.forEach((studio) => {
        studioMap.set(studio.name.toLowerCase(), studio.id);
      });
      const themeMap = new Map<string, number>();
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

  async updateAnime(id: number, data: Prisma.AnimeUpdateInput) {
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

  async updateAnimeReview(id: number, data: Prisma.AnimeReviewUpdateInput) {
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

  async deleteAnime(id: number) {
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

  async deleteMultipleAnimes(ids: number[]) {
    try {
      return await prisma.anime.deleteMany({ where: { id: { in: ids } } });
    } catch (error) {
      throw new InternalServerError((error as Error).message);
    }
  }

  async getTotalData() {
    try {
      return await prisma.anime.count();
    } catch (error) {
      throw new InternalServerError((error as Error).message);
    }
  }

  async getSitemapData(page: number, limit: number) {
    try {
      const data = await prisma.anime.findMany({
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

  async getAnimeStatusCounts() {
    try {
      const totalCount = await this.getTotalData();

      const statusCounts = await prisma.animeReview.groupBy({
        by: ["progressStatus"],
        _count: true
      });

      const countsMap = Object.fromEntries(
        statusCounts.map((count) => [count.progressStatus, count._count])
      );

      const mappedStatus = Object.keys(AnimeService.progressStatuses).map(
        (status) => ({
          label: AnimeService.progressStatuses[status],
          value: status,
          count: countsMap[status] ?? 0
        })
      );

      return [
        {
          label: "All",
          value: null,
          count: totalCount
        },
        ...mappedStatus
      ];
    } catch (error) {
      throw new InternalServerError((error as Error).message);
    }
  }
}
