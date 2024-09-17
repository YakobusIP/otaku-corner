import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";

export class GenreService {
  async getAllGenres(
    connected_media = false,
    currentPage?: number,
    limitPerPage?: number,
    query?: string
  ) {
    const lowerCaseQuery = query && query.toLowerCase();

    const filterCriteria: Prisma.GenreWhereInput = {
      name: {
        contains: lowerCaseQuery,
        mode: "insensitive"
      }
    };

    if (currentPage && limitPerPage) {
      const itemCount = await prisma.genre.count({
        where: filterCriteria
      });

      const pageCount = Math.ceil(itemCount / limitPerPage);

      const data = await prisma.genre.findMany({
        where: filterCriteria,
        take: limitPerPage,
        skip: (currentPage - 1) * limitPerPage
      });

      if (connected_media) {
        for (const genre of data) {
          const mangaCount = await prisma.manga.count({
            where: { genres: { some: { id: genre.id } } }
          });

          const lightNovelCount = await prisma.lightNovel.count({
            where: { genres: { some: { id: genre.id } } }
          });

          (genre as any).connectedMediaCount = mangaCount + lightNovelCount;
        }
      }

      return {
        data,
        metadata: {
          currentPage,
          limitPerPage,
          pageCount,
          itemCount
        }
      };
    } else {
      const data = await prisma.genre.findMany({
        where: filterCriteria
      });

      if (connected_media) {
        for (const genre of data) {
          const animeCount = await prisma.anime.count({
            where: { genres: { some: { id: genre.id } } }
          });

          const mangaCount = await prisma.manga.count({
            where: { genres: { some: { id: genre.id } } }
          });

          const lightNovelCount = await prisma.lightNovel.count({
            where: { genres: { some: { id: genre.id } } }
          });

          (genre as any).connectedMediaCount =
            animeCount + mangaCount + lightNovelCount;
        }
      }

      return data;
    }
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

  async updateGenre(id: number, data: Prisma.GenreUpdateInput) {
    return prisma.genre.update({ where: { id }, data });
  }

  async deleteGenre(id: number) {
    return prisma.genre.delete({ where: { id } });
  }

  async deleteMultipleGenres(ids: number[]) {
    return prisma.genre.deleteMany({ where: { id: { in: ids } } });
  }
}
