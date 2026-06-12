import { Injectable } from "@nestjs/common";

import {
  CrudQueryBuilder,
  CrudQueryResult
} from "@/common/crud/crud-query-builder.interface";
import {
  appendGenreJoinCondition,
  appendMalAndPersonalScoreRangeConditions,
  appendReviewProgressStatusCondition,
  appendStudioJoinCondition,
  appendThemeJoinCondition,
  appendTitleSynonymsSearchConditions,
  buildAndWhereClause,
  buildReviewListCommonOrderBy,
  listSkipTake
} from "@/common/crud/media-review-list-query";

import { AnimeQueryDto } from "@/anime/dto";

@Injectable()
export class AnimeQueryBuilder implements CrudQueryBuilder {
  buildFindAllQuery(query: AnimeQueryDto): CrudQueryResult {
    const conditions: Record<string, unknown>[] = [];

    appendTitleSynonymsSearchConditions(conditions, query.query);
    appendGenreJoinCondition(conditions, query.genre);
    appendStudioJoinCondition(conditions, query.studio);
    appendThemeJoinCondition(conditions, query.theme);
    appendReviewProgressStatusCondition(conditions, query.status);
    appendMalAndPersonalScoreRangeConditions(
      conditions,
      query.malScore,
      query.personalScore
    );

    if (query.type) {
      conditions.push({ type: query.type });
    }

    if (query.statusCheck === "complete") {
      conditions.push({
        OR: [{ type: { in: ["Movie", "OVA"] } }, { episodes: { some: {} } }]
      });
      conditions.push({
        review: {
          reviewText: { not: null },
          consumedAt: { not: null }
        }
      });
    } else if (query.statusCheck === "incomplete") {
      conditions.push({
        OR: [
          {
            AND: [
              { type: { notIn: ["Movie", "OVA"] } },
              { episodes: { none: {} } }
            ]
          },
          {
            review: {
              OR: [{ reviewText: null }, { consumedAt: null }]
            }
          }
        ]
      });
    }

    const where = buildAndWhereClause(conditions);
    const orderBy = buildReviewListCommonOrderBy(query.sort, query.order);

    return {
      where,
      ...listSkipTake(query.page, query.limit),
      orderBy
    };
  }
}
