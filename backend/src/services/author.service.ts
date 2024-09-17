import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";

export class AuthorService {
  async getAllAuthors(
    connected_media = false,
    currentPage?: number,
    limitPerPage?: number,
    query?: string
  ) {
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
  }

  async getAuthor(name: string) {
    return prisma.author.findFirst({
      where: { name: { equals: name, mode: "insensitive" } }
    });
  }

  async createAuthor(data: Prisma.AuthorCreateInput) {
    return prisma.author.create({ data });
  }

  async getOrCreateAuthor(name: string) {
    let author = await this.getAuthor(name);
    if (!author) {
      author = await this.createAuthor({ name });
    }
    return author.id;
  }

  async updateAuthor(id: number, data: Prisma.AuthorUpdateInput) {
    return prisma.author.update({ where: { id }, data });
  }

  async deleteAuthor(id: number) {
    return prisma.author.delete({ where: { id } });
  }

  async deleteMultipleAuthors(ids: number[]) {
    return prisma.author.deleteMany({ where: { id: { in: ids } } });
  }
}
