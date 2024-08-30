import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";

export class ThemeService {
  async getAllThemes() {
    return prisma.theme.findMany();
  }

  async getTheme(name: string) {
    return prisma.theme.findFirst({
      where: { name: { equals: name, mode: "insensitive" } },
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
}
