import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";

export class GenreService {
  async getAllGenres() {
    return prisma.genre.findMany();
  }

  async getGenre(name: string) {
    return prisma.genre.findFirst({
      where: { name: { equals: name, mode: "insensitive" } }
    });
  }

  async createGenre(data: Prisma.GenreCreateInput) {
    return prisma.genre.create({ data });
  }

  async getOrCreateGenre(name: string) {
    let genre = await this.getGenre(name);
    if (!genre) {
      genre = await this.createGenre({ name });
    }
    return genre.id;
  }
}
