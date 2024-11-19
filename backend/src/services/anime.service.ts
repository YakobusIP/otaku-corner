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
      const createdAnimes = await prisma.$transaction(async (prisma) => {
        const allGenres = Array.from(
          new Set(data.flatMap((anime) => anime.genres.map((g) => g.trim())))
        );
        const allStudios = Array.from(
          new Set(data.flatMap((anime) => anime.studios.map((s) => s.trim())))
        );
        const allThemes = Array.from(
          new Set(data.flatMap((anime) => anime.themes.map((t) => t.trim())))
        );

        const [genres, studios, themes] = await Promise.all([
          Promise.all(
            allGenres.map((name) => this.genreService.getOrCreateGenre(name))
          ),
          Promise.all(
            allStudios.map((name) => this.studioService.getOrCreateStudio(name))
          ),
          Promise.all(
            allThemes.map((name) => this.themeService.getOrCreateTheme(name))
          )
        ]);

        const genreMap: Record<string, string> = {};
        genres.forEach((genre) => {
          genreMap[genre.name.toLowerCase()] = genre.id;
        });

        const studioMap: Record<string, string> = {};
        studios.forEach((studio) => {
          studioMap[studio.name.toLowerCase()] = studio.id;
        });

        const themeMap: Record<string, string> = {};
        themes.forEach((theme) => {
          themeMap[theme.name.toLowerCase()] = theme.id;
        });

        const reviewRecords = await prisma.animeReview.createManyAndReturn({
          data: data.map(() => ({}))
        });

        const animeDataWithReviews = data.map((anime, index) => ({
          ...anime,
          reviewId: reviewRecords[index].id
        }));

        const createdAnimes = await prisma.anime.createManyAndReturn({
          data: animeDataWithReviews.map(
            ({
              genres: _genres,
              studios: _studios,
              themes: _themes,
              ...anime
            }) => ({
              ...anime
            })
          ),
          skipDuplicates: true
        });

        const animeGenresData: Prisma.AnimeGenresCreateManyInput[] = [];
        const animeStudiosData: Prisma.AnimeStudiosCreateManyInput[] = [];
        const animeThemesData: Prisma.AnimeThemesCreateManyInput[] = [];

        createdAnimes.forEach((record) => {
          const originalAnime = data.find((a) => a.malId === record.malId);
          if (originalAnime) {
            originalAnime.genres.forEach((name) => {
              const genreId = genreMap[name.toLowerCase()];
              if (genreId) {
                animeGenresData.push({
                  animeId: record.id,
                  genreId
                });
              }
            });

            originalAnime.studios.forEach((name) => {
              const studioId = studioMap[name.toLowerCase()];
              if (studioId) {
                animeStudiosData.push({
                  animeId: record.id,
                  studioId
                });
              }
            });

            originalAnime.themes.forEach((name) => {
              const themeId = themeMap[name.toLowerCase()];
              if (themeId) {
                animeThemesData.push({
                  animeId: record.id,
                  themeId
                });
              }
            });
          }
        });

        await Promise.all([
          prisma.animeGenres.createMany({
            data: animeGenresData,
            skipDuplicates: true
          }),
          prisma.animeStudios.createMany({
            data: animeStudiosData,
            skipDuplicates: true
          }),
          prisma.animeThemes.createMany({
            data: animeThemesData,
            skipDuplicates: true
          })
        ]);

        return createdAnimes;
      });

      return createdAnimes;
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
