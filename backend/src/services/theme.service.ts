import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";

export class ThemeService {
  async getAllThemes(
    connected_media = false,
    currentPage?: number,
    limitPerPage?: number,
    query?: string
  ) {
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
  }
  async getTheme(name: string) {
    return prisma.theme.findFirst({
      where: { name: { equals: name, mode: "insensitive" } }
    });
  }

  async createTheme(data: Prisma.ThemeCreateInput) {
    return prisma.theme.create({ data });
  }

  async getOrCreateTheme(name: string) {
    let theme = await this.getTheme(name);
    if (!theme) {
      theme = await this.createTheme({ name });
    }
    return theme.id;
  }

  async updateTheme(id: string, data: Prisma.ThemeUpdateInput) {
    return prisma.theme.update({ where: { id }, data });
  }

  async deleteTheme(id: string) {
    return prisma.theme.delete({ where: { id } });
  }

  async deleteMultipleThemes(ids: string[]) {
    return prisma.theme.deleteMany({ where: { id: { in: ids } } });
  }
}
