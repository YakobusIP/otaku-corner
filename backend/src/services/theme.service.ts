import { Prisma, Theme } from "@prisma/client";
import { prisma } from "../lib/prisma";
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
  PrismaUniqueError
} from "../lib/error";

interface ThemeWithConnectedMediaCount extends Theme {
  connectedMediaCount?: number;
}

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

      const includeCount: Prisma.ThemeInclude = connected_media
        ? {
            _count: {
              select: {
                animes: true,
                mangas: true,
                lightNovels: true
              }
            }
          }
        : {};

      if (currentPage && limitPerPage) {
        const [itemCount, data] = await prisma.$transaction([
          prisma.theme.count({ where: filterCriteria }),
          prisma.theme.findMany({
            where: filterCriteria,
            take: limitPerPage,
            skip: (currentPage - 1) * limitPerPage,
            include: includeCount
          })
        ]);

        const pageCount = Math.ceil(itemCount / limitPerPage);

        const themesWithCounts: ThemeWithConnectedMediaCount[] = connected_media
          ? data.map((theme) => ({
              ...theme,
              connectedMediaCount:
                theme._count.animes +
                theme._count.mangas +
                theme._count.lightNovels
            }))
          : data;

        return {
          data: themesWithCounts,
          metadata: {
            currentPage,
            limitPerPage,
            pageCount,
            itemCount
          }
        };
      } else {
        const data = await prisma.theme.findMany({
          where: filterCriteria,
          include: includeCount
        });

        const themesWithCounts: ThemeWithConnectedMediaCount[] = connected_media
          ? data.map((theme) => ({
              ...theme,
              connectedMediaCount:
                theme._count.animes +
                theme._count.mangas +
                theme._count.lightNovels
            }))
          : data;

        return themesWithCounts;
      }
    } catch (error) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new BadRequestError("Invalid request parameters!");
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
    try {
      return await prisma.theme.upsert({
        where: { name },
        update: {},
        create: { name }
      });
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

  async getOrCreateThemes(names: string[]) {
    try {
      const normalizedNames = names.map((name) => name.trim());

      const existingThemes = await prisma.theme.findMany({
        where: { name: { in: normalizedNames } }
      });

      const existingNameSet = new Set(existingThemes.map((a) => a.name));

      const newThemeNames = normalizedNames.filter(
        (name) => !existingNameSet.has(name)
      );

      let newThemes: Theme[] = [];
      if (newThemeNames.length > 0) {
        newThemes = await prisma.theme.createManyAndReturn({
          data: newThemeNames.map((name) => ({ name })),
          skipDuplicates: true
        });
      }

      const allThemes = [...existingThemes, ...newThemes];

      return allThemes;
    } catch (error) {
      throw new InternalServerError((error as Error).message);
    }
  }

  async updateTheme(id: number, data: Prisma.ThemeUpdateInput) {
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

  async deleteTheme(id: number) {
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

  async deleteMultipleThemes(ids: number[]) {
    try {
      return await prisma.theme.deleteMany({ where: { id: { in: ids } } });
    } catch (error) {
      throw new InternalServerError((error as Error).message);
    }
  }
}
