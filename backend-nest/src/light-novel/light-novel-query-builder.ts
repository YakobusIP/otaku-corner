import { Injectable } from "@nestjs/common";

import { SCORE_RANGES } from "@/common/constants/progress-statuses";
import {
  CrudQueryBuilder,
  CrudQueryResult
} from "@/common/crud/crud-query-builder.interface";

import { LightNovelQueryDto } from "@/light-novel/dto";

@Injectable()
export class LightNovelQueryBuilder implements CrudQueryBuilder {
  buildFindAllQuery(query: LightNovelQueryDto): CrudQueryResult {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const conditions: Record<string, unknown>[] = [];

    if (query.query) {
      conditions.push({
        OR: [
          { title: { contains: query.query, mode: "insensitive" } },
          { titleSynonyms: { contains: query.query, mode: "insensitive" } }
        ]
      });
    }

    if (query.author) {
      conditions.push({
        authors: { some: { authorId: query.author } }
      });
    }

    if (query.genre) {
      conditions.push({
        genres: { some: { genreId: query.genre } }
      });
    }

    if (query.theme) {
      conditions.push({
        themes: { some: { themeId: query.theme } }
      });
    }

    if (query.status) {
      conditions.push({
        review: { progressStatus: query.status }
      });
    }

    if (query.malScore && SCORE_RANGES[query.malScore]) {
      const range = SCORE_RANGES[query.malScore];
      conditions.push({
        score: { gte: range.min, lte: range.max }
      });
    }

    if (query.personalScore && SCORE_RANGES[query.personalScore]) {
      const range = SCORE_RANGES[query.personalScore];
      conditions.push({
        review: { personalScore: { gte: range.min, lte: range.max } }
      });
    }

    if (query.statusCheck === "complete") {
      conditions.push({
        volumesCount: { not: null },
        review: {
          reviewText: { not: null },
          progressStatus: { not: "DROPPED" }
        },
        volumeProgress: { every: { consumedAt: { not: null } } }
      });
    } else if (query.statusCheck === "incomplete") {
      conditions.push({
        OR: [
          { volumesCount: null },
          { review: { reviewText: null } },
          { review: { progressStatus: "DROPPED" } },
          { volumeProgress: { some: { consumedAt: null } } }
        ]
      });
    }

    const where = conditions.length > 0 ? { AND: conditions } : {};

    const orderBy = this.buildOrderBy(query.sort, query.order);

    return {
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy
    };
  }

  private buildOrderBy(
    sort?: string,
    order?: string
  ): Record<string, unknown> | undefined {
    const direction = order === "asc" ? "asc" : "desc";

    switch (sort) {
      case "title":
        return { title: direction };
      case "score":
        return { score: direction };
      case "personal_score":
        return {
          review: {
            personalScore: { sort: direction, nulls: "last" }
          }
        };
      default:
        return undefined;
    }
  }
}
