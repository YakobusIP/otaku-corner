import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { GenreService } from "./genre.service";
import { StudioService } from "./studio.service";
import { ThemeService } from "./theme.service";

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

type CustomAnimeReviewUpdateInput = Pick<
  Prisma.AnimeUpdateInput,
  | "review"
  | "storylineRating"
  | "qualityRating"
  | "voiceActingRating"
  | "enjoymentRating"
  | "personalScore"
>;

export class AnimeService {
  constructor(
    private readonly genreService: GenreService,
    private readonly studioService: StudioService,
    private readonly themeService: ThemeService
  ) {}

  async getAllAnimes(
    query?: string,
    sortBy?: string,
    sortOrder?: Prisma.SortOrder,
    filterGenre?: number,
    filterStudio?: number,
    filterTheme?: number,
    filterMALScore?: string,
    filterPersonalScore?: string,
    filterType?: string
  ) {
    const lowerCaseQuery = query && query.toLowerCase();
    const scoreRanges: Record<string, { min: number; max: number }> = {
      poor: { min: 1, max: 3.99 },
      average: { min: 4, max: 6.99 },
      good: { min: 7, max: 8.99 },
      excellent: { min: 9, max: 10 },
    };

    console.log(filterMALScore && scoreRanges[filterMALScore]);
    return prisma.anime.findMany({
      where: {
        AND: [
          {
            OR: [
              {
                title: {
                  contains: lowerCaseQuery,
                  mode: "insensitive",
                },
              },
              {
                titleSynonyms: {
                  contains: lowerCaseQuery,
                  mode: "insensitive",
                },
              },
            ],
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
                    lte: scoreRanges[filterMALScore].max,
                  },
                },
              ]
            : []),
          ...(filterPersonalScore
            ? [
                {
                  personalScore: {
                    gte: scoreRanges[filterPersonalScore].min,
                    lte: scoreRanges[filterPersonalScore].max,
                  },
                },
              ]
            : []),
          ...(filterType ? [{ type: { equals: filterType } }] : []),
        ],
      },
      select: {
        id: true,
        title: true,
        titleJapanese: true,
        images: true,
        status: true,
        type: true,
        score: true,
        rating: true,
        personalScore: true,
      },
      orderBy: {
        title: sortBy === "title" ? sortOrder : undefined,
        score: sortBy === "score" ? sortOrder : undefined,
      },
    });
  }

  async getAnimeById(id: number) {
    return prisma.anime.findUnique({
      where: { id },
      include: {
        genres: { select: { id: true, name: true } },
        studios: { select: { id: true, name: true } },
        themes: { select: { id: true, name: true } },
        episodes: { orderBy: { number: "asc" } },
      },
    });
  }

  async createAnime(data: CustomAnimeCreateInput) {
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
      episodes: undefined,
    };

    if (data.episodes && data.episodes.length > 0) {
      return prisma.anime.create({
        data: {
          ...animeData,
          episodes: { createMany: { data: data.episodes } },
        },
      });
    } else {
      return prisma.anime.create({ data: animeData });
    }
  }

  async updateAnime(id: number, data: Prisma.AnimeUpdateInput) {
    return prisma.anime.update({ where: { id }, data });
  }

  async updateAnimeReview(id: number, data: CustomAnimeReviewUpdateInput) {
    return prisma.anime.update({ where: { id }, data });
  }

  async deleteAnime(id: number) {
    return prisma.anime.delete({ where: { id } });
  }

  async deleteMultipleAnime(ids: Array<number>) {
    return prisma.anime.deleteMany({ where: { id: { in: ids } } });
  }
}
