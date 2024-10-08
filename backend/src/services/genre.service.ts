import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
  PrismaUniqueError
} from "../lib/error";

export class GenreService {
  async getAllGenres(
    connected_media = false,
    currentPage?: number,
    limitPerPage?: number,
    query?: string
  ) {
    try {
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
    } catch (error) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new BadRequestError("Invalid request parameters!");
      }

      throw new InternalServerError((error as Error).message);
    }
  }

  async getGenre(name: string) {
    try {
      return await prisma.genre.findFirst({
        where: { name: { equals: name, mode: "insensitive" } }
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new InternalServerError((error as Error).message);
    }
  }

  async createGenre(data: Prisma.GenreCreateInput) {
    try {
      return await prisma.genre.create({ data });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new PrismaUniqueError("Genre already exists!");
      }

      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new BadRequestError("Invalid request body!");
      }

      throw new InternalServerError((error as Error).message);
    }
  }

  async getOrCreateGenre(name: string) {
    let genre = await this.getGenre(name);
    if (!genre) {
      genre = await this.createGenre({ name });
    }
    return genre.id;
  }

  async updateGenre(id: string, data: Prisma.GenreUpdateInput) {
    try {
      return await prisma.genre.update({ where: { id }, data });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new NotFoundError("Genre not found!");
      }

      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new BadRequestError("Invalid request body!");
      }

      throw new InternalServerError((error as Error).message);
    }
  }

  async deleteGenre(id: string) {
    try {
      return await prisma.genre.delete({ where: { id } });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new NotFoundError("Genre not found!");
      }

      throw new InternalServerError((error as Error).message);
    }
  }

  async deleteMultipleGenres(ids: string[]) {
    try {
      return await prisma.genre.deleteMany({ where: { id: { in: ids } } });
    } catch (error) {
      throw new InternalServerError((error as Error).message);
    }
  }
}
