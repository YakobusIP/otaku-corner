import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";

export class AnimeService {
  async getAllAnimes(query: string) {
    const lowerCaseQuery = query.toLowerCase();
    return prisma.anime.findMany({
      where: {
        OR: [
          {
            title: {
              contains: lowerCaseQuery,
              mode: "insensitive",
            },
          },
          {
            title_synonyms: {
              contains: lowerCaseQuery,
              mode: "insensitive",
            },
          },
        ],
      },
      select: {
        id: true,
        title: true,
        title_japanese: true,
        title_synonyms: true,
        images: true,
        status: true,
        type: true,
        score: true,
        rating: true,
      },
    });
  }

  async getAnimeById(id: string) {
    return prisma.anime.findUnique({ where: { id } });
  }

  async createAnime(data: Prisma.AnimeCreateInput) {
    return prisma.anime.create({ data });
  }

  async updateAnime(id: string, data: Prisma.AnimeUpdateInput) {
    return prisma.anime.update({ where: { id }, data });
  }

  async deleteAnime(id: string) {
    return prisma.anime.delete({ where: { id } });
  }

  async deleteMultipleAnime(ids: Array<string>) {
    return prisma.anime.deleteMany({ where: { id: { in: ids } } });
  }
}
