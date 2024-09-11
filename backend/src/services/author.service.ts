import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";

export class AuthorService {
  async getAllAuthors() {
    return prisma.author.findMany();
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
}
