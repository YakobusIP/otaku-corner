import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";

export class StudioService {
  async getAllStudios(
    connected_media = false,
    currentPage?: number,
    limitPerPage?: number,
    query?: string
  ) {
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
  }

  async getStudio(name: string) {
    return prisma.studio.findFirst({
      where: { name: { equals: name, mode: "insensitive" } }
    });
  }

  async createStudio(data: Prisma.StudioCreateInput) {
    return prisma.studio.create({ data });
  }

  async getOrCreateStudio(name: string) {
    let studio = await this.getStudio(name);
    if (!studio) {
      studio = await this.createStudio({ name });
    }
    return studio.id;
  }

  async updateStudio(id: number, data: Prisma.StudioUpdateInput) {
    return prisma.studio.update({ where: { id }, data });
  }

  async deleteStudio(id: number) {
    return prisma.studio.delete({ where: { id } });
  }

  async deleteMultipleStudios(ids: number[]) {
    return prisma.studio.deleteMany({ where: { id: { in: ids } } });
  }
}
