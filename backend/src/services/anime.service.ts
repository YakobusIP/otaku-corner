import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";

export class AnimeService {
  async getAllAnimes() {
    return prisma.anime.findMany({
      select: {
        id: true,
        title: true,
        title_japanese: true,
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
