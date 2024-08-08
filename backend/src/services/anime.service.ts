import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { AnimeReview } from "../../type/anime.type";

type CustomAnimeCreateInput = Omit<Prisma.AnimeCreateInput, "episodes"> & {
  episodes: {
    aired: string;
    number: number;
    title: string;
    titleJapanese?: string;
    titleRomaji?: string;
  }[];
};

export class AnimeService {
  async getAllAnimes(query: string) {
    const lowerCaseQuery = query.toLowerCase();
    const animes = await prisma.anime.findMany({
      where: {
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
      select: {
        id: true,
        title: true,
        titleJapanese: true,
        images: true,
        status: true,
        type: true,
        score: true,
        rating: true,
        review: true,
      },
    });

    const processedAnimes = animes.map((anime) => {
      let averageRating = null;
      if (anime.review) {
        const review = anime.review as AnimeReview;
        const ratings = [
          review.storylineRating,
          review.qualityRating,
          review.voiceActingRating,
          review.enjoymentRating,
        ];
        averageRating =
          ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
      }

      return { ...anime, personalScore: averageRating };
    });

    return processedAnimes;
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

  async updateAnimeReview(id: string, data: Prisma.InputJsonValue) {
    return prisma.anime.update({ where: { id }, data: { review: data } });
  }

  async deleteAnime(id: string) {
    return prisma.anime.delete({ where: { id } });
  }

  async deleteMultipleAnime(ids: Array<string>) {
    return prisma.anime.deleteMany({ where: { id: { in: ids } } });
  }
}
