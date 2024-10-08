import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
  PrismaUniqueError
} from "../lib/error";

export class StudioService {
  async getAllStudios(
    connected_media = false,
    currentPage?: number,
    limitPerPage?: number,
    query?: string
  ) {
    try {
      const lowerCaseQuery = query && query.toLowerCase();

      const filterCriteria: Prisma.StudioWhereInput = {
        name: {
          contains: lowerCaseQuery,
          mode: "insensitive"
        }
      };

      if (currentPage && limitPerPage) {
        const itemCount = await prisma.studio.count({
          where: filterCriteria
        });

        const pageCount = Math.ceil(itemCount / limitPerPage);

        const data = await prisma.studio.findMany({
          where: filterCriteria,
          take: limitPerPage,
          skip: (currentPage - 1) * limitPerPage
        });

        if (connected_media) {
          for (const studio of data) {
            const animeCount = await prisma.anime.count({
              where: { studios: { some: { id: studio.id } } }
            });

            (studio as any).connectedMediaCount = animeCount;
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
        const data = await prisma.studio.findMany({
          where: filterCriteria
        });

        if (connected_media) {
          for (const studio of data) {
            const animeCount = await prisma.anime.count({
              where: { studios: { some: { id: studio.id } } }
            });

            (studio as any).connectedMediaCount = animeCount;
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

  async getStudio(name: string) {
    try {
      return await prisma.studio.findFirst({
        where: { name: { equals: name, mode: "insensitive" } }
      });
    } catch (error) {
      throw new InternalServerError((error as Error).message);
    }
  }

  async createStudio(data: Prisma.StudioCreateInput) {
    try {
      return await prisma.studio.create({ data });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new PrismaUniqueError("Studio already exists!");
      }

      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new BadRequestError("Invalid request body!");
      }

      throw new InternalServerError((error as Error).message);
    }
  }

  async getOrCreateStudio(name: string) {
    let studio = await this.getStudio(name);
    if (!studio) {
      studio = await this.createStudio({ name });
    }
    return studio.id;
  }

  async updateStudio(id: string, data: Prisma.StudioUpdateInput) {
    try {
      return await prisma.studio.update({ where: { id }, data });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new NotFoundError("Studio not found!");
      }

      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new BadRequestError("Invalid request body!");
      }

      throw new InternalServerError((error as Error).message);
    }
  }

  async deleteStudio(id: string) {
    try {
      return await prisma.studio.delete({ where: { id } });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new NotFoundError("Studio not found!");
      }

      throw new InternalServerError((error as Error).message);
    }
  }

  async deleteMultipleStudios(ids: string[]) {
    try {
      return await prisma.studio.deleteMany({ where: { id: { in: ids } } });
    } catch (error) {
      throw new InternalServerError((error as Error).message);
    }
  }
}
