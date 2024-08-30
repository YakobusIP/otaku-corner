import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";

type CustomAnimeCreateInput = Omit<Prisma.AnimeCreateInput, "episodes"> & {
  episodes: {
    aired: string;
    number: number;
    title: string;
    titleJapanese?: string;
    titleRomaji?: string;
  }[];
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
  async getAllAnimes(
    query?: string,
    sortBy?: string,
    sortOrder?: Prisma.SortOrder,
    filterGenre?: string,
    filterScore?: string,
    filterType?: string
  ) {
    const lowerCaseQuery = query && query.toLowerCase();
    const scoreRanges: Record<string, { min: number; max: number }> = {
      poor: { min: 1, max: 3 },
      average: { min: 4, max: 6 },
      good: { min: 7, max: 8 },
      excellent: { min: 9, max: 10 },
    };
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
          filterGenre ? { genres: { has: filterGenre } } : {},
          filterScore
            ? {
                personalScore: {
                  gte: scoreRanges[filterScore].min,
                  lte: scoreRanges[filterScore].max,
                },
              }
            : {},
          filterType ? { type: { equals: filterType } } : {},
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

  async getAnimeById(id: string) {
    return prisma.anime.findUnique({
      where: { id },
      include: { episodes: { orderBy: { number: "asc" } } },
    });
  }

  async createAnime(data: CustomAnimeCreateInput) {
    const animeData: Prisma.AnimeCreateInput = { ...data, episodes: undefined };

    if (data.episodes && data.episodes.length > 0) {
      return prisma.anime.create({
        data: { ...data, episodes: { createMany: { data: data.episodes } } },
      });
    } else {
      return prisma.anime.create({ data: animeData });
    }
  }

  async updateAnime(id: string, data: Prisma.AnimeUpdateInput) {
    return prisma.anime.update({ where: { id }, data });
  }

  async updateAnimeReview(id: string, data: CustomAnimeReviewUpdateInput) {
    return prisma.anime.update({ where: { id }, data });
  }

  async deleteAnime(id: string) {
    return prisma.anime.delete({ where: { id } });
  }

  async deleteMultipleAnime(ids: Array<string>) {
    return prisma.anime.deleteMany({ where: { id: { in: ids } } });
  }
}
