import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
  PrismaUniqueError
} from "../lib/error";

export class AuthorService {
  async getAllAuthors(
    connected_media = false,
    currentPage?: number,
    limitPerPage?: number,
    query?: string
  ) {
    try {
      const lowerCaseQuery = query && query.toLowerCase();

      const filterCriteria: Prisma.AuthorWhereInput = {
        name: {
          contains: lowerCaseQuery,
          mode: "insensitive"
        }
      };

      if (currentPage && limitPerPage) {
        const itemCount = await prisma.author.count({
          where: filterCriteria
        });

        const pageCount = Math.ceil(itemCount / limitPerPage);

        const data = await prisma.author.findMany({
          where: filterCriteria,
          take: limitPerPage,
          skip: (currentPage - 1) * limitPerPage
        });

        if (connected_media) {
          for (const author of data) {
            const mangaCount = await prisma.manga.count({
              where: { authors: { some: { id: author.id } } }
            });

            const lightNovelCount = await prisma.lightNovel.count({
              where: { authors: { some: { id: author.id } } }
            });

            (author as any).connectedMediaCount = mangaCount + lightNovelCount;
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
        const data = await prisma.author.findMany({
          where: filterCriteria
        });

        if (connected_media) {
          for (const author of data) {
            const mangaCount = await prisma.manga.count({
              where: { authors: { some: { id: author.id } } }
            });

            const lightNovelCount = await prisma.lightNovel.count({
              where: { authors: { some: { id: author.id } } }
            });

            (author as any).connectedMediaCount = mangaCount + lightNovelCount;
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

  async getAuthor(name: string) {
    try {
      return await prisma.author.findFirst({
        where: { name: { equals: name, mode: "insensitive" } }
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new InternalServerError((error as Error).message);
    }
  }

  async createAuthor(data: Prisma.AuthorCreateInput) {
    try {
      return await prisma.author.create({ data });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new PrismaUniqueError("Author already exists!");
      }

      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new BadRequestError("Invalid request body!");
      }

      throw new InternalServerError((error as Error).message);
    }
  }

  async getOrCreateAuthor(name: string) {
    let author = await this.getAuthor(name);
    if (!author) {
      author = await this.createAuthor({ name });
    }
    return author.id;
  }

  async updateAuthor(id: string, data: Prisma.AuthorUpdateInput) {
    try {
      return await prisma.author.update({ where: { id }, data });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new NotFoundError("Author not found!");
      }

      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new BadRequestError("Invalid request body!");
      }

      throw new InternalServerError((error as Error).message);
    }
  }

  async deleteAuthor(id: string) {
    try {
      return await prisma.author.delete({ where: { id } });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new NotFoundError("Author not found!");
      }

      throw new InternalServerError((error as Error).message);
    }
  }

  async deleteMultipleAuthors(ids: string[]) {
    try {
      return await prisma.author.deleteMany({ where: { id: { in: ids } } });
    } catch (error) {
      throw new InternalServerError((error as Error).message);
    }
  }
}
