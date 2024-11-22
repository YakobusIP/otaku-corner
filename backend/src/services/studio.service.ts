import { Prisma, Studio } from "@prisma/client";
import { prisma } from "../lib/prisma";
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
  PrismaUniqueError
} from "../lib/error";

interface StudioWithConnectedMediaCount extends Studio {
  connectedMediaCount?: number;
}

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

      const includeCount: Prisma.StudioInclude = connected_media
        ? {
            _count: {
              select: {
                animes: true
              }
            }
          }
        : {};

      if (currentPage && limitPerPage) {
        const [itemCount, data] = await prisma.$transaction([
          prisma.studio.count({ where: filterCriteria }),
          prisma.studio.findMany({
            where: filterCriteria,
            take: limitPerPage,
            skip: (currentPage - 1) * limitPerPage,
            include: includeCount
          })
        ]);

        const pageCount = Math.ceil(itemCount / limitPerPage);

        const studiosWithCounts: StudioWithConnectedMediaCount[] =
          connected_media
            ? data.map((studio) => ({
                ...studio,
                connectedMediaCount: studio._count.animes
              }))
            : data;

        return {
          data: studiosWithCounts,
          metadata: {
            currentPage,
            limitPerPage,
            pageCount,
            itemCount
          }
        };
      } else {
        const data = await prisma.studio.findMany({
          where: filterCriteria,
          include: includeCount
        });

        const studiosWithCounts: StudioWithConnectedMediaCount[] =
          connected_media
            ? data.map((studio) => ({
                ...studio,
                connectedMediaCount: studio._count.animes
              }))
            : data;

        return studiosWithCounts;
      }
    } catch (error) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new BadRequestError("Invalid request parameters!");
      }

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
    try {
      return await prisma.studio.upsert({
        where: { name },
        update: {},
        create: { name }
      });
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

  async getOrCreateStudios(names: string[]) {
    try {
      const normalizedNames = names.map((name) => name.trim());

      const existingStudios = await prisma.studio.findMany({
        where: { name: { in: normalizedNames } }
      });

      const existingNameSet = new Set(existingStudios.map((a) => a.name));

      const newStudioNames = normalizedNames.filter(
        (name) => !existingNameSet.has(name)
      );

      let newStudios: Studio[] = [];
      if (newStudioNames.length > 0) {
        newStudios = await prisma.studio.createManyAndReturn({
          data: newStudioNames.map((name) => ({ name })),
          skipDuplicates: true
        });
      }

      const allStudios = [...existingStudios, ...newStudios];

      return allStudios;
    } catch (error) {
      throw new InternalServerError((error as Error).message);
    }
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
