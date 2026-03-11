import { Injectable } from "@nestjs/common";
import {
  CrudQueryBuilder,
  CrudQueryResult,
} from "@/common/crud/crud-query-builder.interface";
import { LightNovelQueryDto } from "@/light-novel/dto";
import {
  PROGRESS_STATUSES,
  SCORE_RANGES,
} from "@/common/constants/progress-statuses";

@Injectable()
export class LightNovelQueryBuilder implements CrudQueryBuilder {
  buildFindAllQuery(query: LightNovelQueryDto): CrudQueryResult {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const where: Record<string, unknown> = {};
    const conditions: Record<string, unknown>[] = [];

    if (query.query) {
      where.title = { contains: query.query, mode: "insensitive" };
    }

    if (query.author) {
      conditions.push({
        authors: { some: { authorId: query.author } },
      });
    }

    if (query.genre) {
      conditions.push({
        genres: { some: { genreId: query.genre } },
      });
    }

    if (query.theme) {
      conditions.push({
        themes: { some: { themeId: query.theme } },
      });
    }

    if (query.status && query.status in PROGRESS_STATUSES) {
      conditions.push({
        review: { progressStatus: query.status },
      });
    }

    if (query.malScore && query.malScore in SCORE_RANGES) {
      const range = SCORE_RANGES[query.malScore];
      conditions.push({
        score: { gte: range.min, lte: range.max },
      });
    }

    if (query.personalScore && query.personalScore in SCORE_RANGES) {
      const range = SCORE_RANGES[query.personalScore];
      conditions.push({
        review: { personalScore: { gte: range.min, lte: range.max } },
      });
    }

    if (query.statusCheck) {
      if (query.statusCheck === "complete") {
        conditions.push({
          volumesCount: { not: null },
          review: {
            reviewText: { not: null },
            progressStatus: { not: "DROPPED" },
          },
          volumeProgress: { every: { consumedAt: { not: null } } },
        });
      } else if (query.statusCheck === "incomplete") {
        conditions.push({
          OR: [
            { volumesCount: null },
            { review: { reviewText: null } },
            { review: { progressStatus: "DROPPED" } },
            { volumeProgress: { some: { consumedAt: null } } },
          ],
        });
      }
    }

    if (conditions.length > 0) {
      where.AND = conditions;
    }

    let orderBy: Record<string, unknown> | undefined;
    if (query.sort) {
      orderBy = { [query.sort]: query.order ?? "asc" };
    }

    return {
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy,
      include: {
        review: {
          select: {
            reviewText: true,
            progressStatus: true,
            personalScore: true,
          },
        },
        volumeProgress: {
          select: {
            volumeNumber: true,
            consumedAt: true,
          },
          orderBy: { volumeNumber: "asc" },
        },
      },
    };
  }
}
