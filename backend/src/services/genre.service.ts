import { Genre, Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
  PrismaUniqueError
} from "../lib/error";

interface GenreWithConnectedMediaCount extends Genre {
  connectedMediaCount?: number;
}

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

      const includeCount: Prisma.GenreInclude = connected_media
        ? {
            _count: {
              select: { animes: true, mangas: true, lightNovels: true }
            }
          }
        : {};

      if (currentPage && limitPerPage) {
        const [itemCount, data] = await prisma.$transaction([
          prisma.genre.count({ where: filterCriteria }),
          prisma.genre.findMany({
            where: filterCriteria,
            take: limitPerPage,
            skip: (currentPage - 1) * limitPerPage,
            include: includeCount
          })
        ]);

        const pageCount = Math.ceil(itemCount / limitPerPage);

        const genresWithCounts: GenreWithConnectedMediaCount[] = connected_media
          ? data.map((genre) => ({
              ...genre,
              connectedMediaCount:
                genre._count.animes +
                genre._count.mangas +
                genre._count.lightNovels
            }))
          : data;

        return {
          data: genresWithCounts,
          metadata: {
            currentPage,
            limitPerPage,
            pageCount,
            itemCount
          }
        };
      } else {
        const data = await prisma.genre.findMany({
          where: filterCriteria,
          include: includeCount
        });

        const genresWithCounts: GenreWithConnectedMediaCount[] = connected_media
          ? data.map((genre) => ({
              ...genre,
              connectedMediaCount:
                genre._count.animes +
                genre._count.mangas +
                genre._count.lightNovels
            }))
          : data;

        return genresWithCounts;
      }
    } catch (error) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new BadRequestError("Invalid request parameters!");
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
    try {
      return await prisma.genre.upsert({
        where: { name },
        update: {},
        create: { name }
      });
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

  async getOrCreateGenres(names: string[]) {
    try {
      const normalizedNames = names.map((name) => name.trim());

      const existingGenres = await prisma.genre.findMany({
        where: { name: { in: normalizedNames } }
      });

      const existingNameSet = new Set(existingGenres.map((a) => a.name));

      const newGenreNames = normalizedNames.filter(
        (name) => !existingNameSet.has(name)
      );

      let newGenres: Genre[] = [];
      if (newGenreNames.length > 0) {
        newGenres = await prisma.genre.createManyAndReturn({
          data: newGenreNames.map((name) => ({ name })),
          skipDuplicates: true
        });
      }

      const allGenres = [...existingGenres, ...newGenres];

      return allGenres;
    } catch (error) {
      throw new InternalServerError((error as Error).message);
    }
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
