import { BadRequestException, Injectable } from "@nestjs/common";

import { PrismaService } from "@/prisma/prisma.service";

import { Prisma } from "@prisma/client";

@Injectable()
export class StatisticTopRatedService {
  constructor(private readonly prisma: PrismaService) {}

  private topRatedYearBounds(year: number, now: Date) {
    if (year > now.getUTCFullYear()) {
      throw new BadRequestException("Year cannot be in the future");
    }
    const start = new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0));
    const endOfYear = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));
    const end =
      year === now.getUTCFullYear() && now.getTime() < endOfYear.getTime()
        ? now
        : endOfYear;
    return { start, end };
  }

  async getTopRatedThisYear(year: number) {
    const now = new Date();
    const { start, end } = this.topRatedYearBounds(year, now);

    const [topAnime, topManga, topLightNovel] = await Promise.all([
      this.prisma.anime.findFirst({
        where: {
          review: {
            personalScore: { not: null },
            consumedAt: { not: null, gte: start, lte: end }
          }
        },
        orderBy: { review: { personalScore: "desc" } },
        select: {
          id: true,
          slug: true,
          title: true,
          images: true,
          review: { select: { personalScore: true } }
        }
      }),
      this.prisma.manga.findFirst({
        where: {
          review: {
            personalScore: { not: null },
            consumedAt: { not: null, gte: start, lte: end }
          }
        },
        orderBy: { review: { personalScore: "desc" } },
        select: {
          id: true,
          slug: true,
          title: true,
          images: true,
          review: { select: { personalScore: true } }
        }
      }),
      this.prisma.lightNovel.findFirst({
        where: {
          review: { personalScore: { not: null } },
          volumeProgress: {
            some: {
              consumedAt: { not: null, gte: start, lte: end }
            }
          }
        },
        orderBy: { review: { personalScore: "desc" } },
        select: {
          id: true,
          slug: true,
          title: true,
          images: true,
          review: { select: { personalScore: true } }
        }
      })
    ]);

    const pack = (
      row: {
        id: number;
        slug: string;
        title: string;
        images: Prisma.JsonValue;
        review: { personalScore: number | null } | null;
      } | null
    ) =>
      row
        ? {
            id: row.id,
            slug: row.slug,
            title: row.title,
            images: row.images,
            personalScore: row.review?.personalScore ?? null
          }
        : null;

    return {
      year,
      anime: pack(topAnime),
      manga: pack(topManga),
      lightNovel: pack(topLightNovel)
    };
  }

  async getTopRatedAllTime() {
    const [topAnime, topManga, topLightNovel] = await Promise.all([
      this.prisma.anime.findFirst({
        where: { review: { personalScore: { not: null } } },
        orderBy: { review: { personalScore: "desc" } },
        select: {
          id: true,
          slug: true,
          title: true,
          images: true,
          review: { select: { personalScore: true } }
        }
      }),
      this.prisma.manga.findFirst({
        where: { review: { personalScore: { not: null } } },
        orderBy: { review: { personalScore: "desc" } },
        select: {
          id: true,
          slug: true,
          title: true,
          images: true,
          review: { select: { personalScore: true } }
        }
      }),
      this.prisma.lightNovel.findFirst({
        where: { review: { personalScore: { not: null } } },
        orderBy: { review: { personalScore: "desc" } },
        select: {
          id: true,
          slug: true,
          title: true,
          images: true,
          review: { select: { personalScore: true } }
        }
      })
    ]);

    const pack = (
      row: {
        id: number;
        slug: string;
        title: string;
        images: Prisma.JsonValue;
        review: { personalScore: number | null } | null;
      } | null
    ) =>
      row
        ? {
            id: row.id,
            slug: row.slug,
            title: row.title,
            images: row.images,
            personalScore: row.review?.personalScore ?? null
          }
        : null;

    return {
      year: null,
      anime: pack(topAnime),
      manga: pack(topManga),
      lightNovel: pack(topLightNovel)
    };
  }
}
