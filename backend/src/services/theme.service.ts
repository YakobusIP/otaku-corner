import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
  PrismaUniqueError
} from "../lib/error";

export class ThemeService {
  async getAllThemes(
    connected_media = false,
    currentPage?: number,
    limitPerPage?: number,
    query?: string
  ) {
    try {
      const lowerCaseQuery = query && query.toLowerCase();

      const filterCriteria: Prisma.ThemeWhereInput = {
        name: {
          contains: lowerCaseQuery,
          mode: "insensitive"
        }
      };

      if (currentPage && limitPerPage) {
        const itemCount = await prisma.theme.count({
          where: filterCriteria
        });

        const pageCount = Math.ceil(itemCount / limitPerPage);

        const data = await prisma.theme.findMany({
          where: filterCriteria,
          take: limitPerPage,
          skip: (currentPage - 1) * limitPerPage
        });

        if (connected_media) {
          for (const theme of data) {
            const mangaCount = await prisma.manga.count({
              where: { themes: { some: { id: theme.id } } }
            });

            const lightNovelCount = await prisma.lightNovel.count({
              where: { themes: { some: { id: theme.id } } }
            });

            (theme as any).connectedMediaCount = mangaCount + lightNovelCount;
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
        const data = await prisma.theme.findMany({
          where: filterCriteria
        });

        if (connected_media) {
          for (const theme of data) {
            const animeCount = await prisma.anime.count({
              where: { themes: { some: { id: theme.id } } }
            });

            const mangaCount = await prisma.manga.count({
              where: { themes: { some: { id: theme.id } } }
            });

            const lightNovelCount = await prisma.lightNovel.count({
              where: { themes: { some: { id: theme.id } } }
            });

            (theme as any).connectedMediaCount =
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
  async getTheme(name: string) {
    try {
      return await prisma.theme.findFirst({
        where: { name: { equals: name, mode: "insensitive" } }
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new InternalServerError((error as Error).message);
    }
  }

  async createTheme(data: Prisma.ThemeCreateInput) {
    try {
      return await prisma.theme.create({ data });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new PrismaUniqueError("Theme already exists!");
      }

      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new BadRequestError("Invalid request body!");
      }

      throw new InternalServerError((error as Error).message);
    }
  }

  async getOrCreateTheme(name: string) {
    let theme = await this.getTheme(name);
    if (!theme) {
      theme = await this.createTheme({ name });
    }
    return theme.id;
  }

  async updateTheme(id: string, data: Prisma.ThemeUpdateInput) {
    try {
      return await prisma.theme.update({ where: { id }, data });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new NotFoundError("Theme not found!");
      }

      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new BadRequestError("Invalid request body!");
      }

      throw new InternalServerError((error as Error).message);
    }
  }

  async deleteTheme(id: string) {
    try {
      return await prisma.theme.delete({ where: { id } });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new NotFoundError("Theme not found!");
      }

      throw new InternalServerError((error as Error).message);
    }
  }

  async deleteMultipleThemes(ids: string[]) {
    try {
      return await prisma.theme.deleteMany({ where: { id: { in: ids } } });
    } catch (error) {
      throw new InternalServerError((error as Error).message);
    }
  }
}
