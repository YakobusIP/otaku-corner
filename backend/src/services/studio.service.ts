import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";

export class StudioService {
  async getAllStudios() {
    return prisma.studio.findMany();
  }

  async getStudio(name: string) {
    return prisma.studio.findFirst({
      where: { name: { equals: name, mode: "insensitive" } },
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
}
