import { Injectable } from "@nestjs/common";

import {
  CrudQueryBuilder,
  CrudQueryResult
} from "@/common/crud/crud-query-builder.interface";
import {
  appendAuthorJoinCondition,
  appendGenreJoinCondition,
  appendMalAndPersonalScoreRangeConditions,
  appendReviewProgressStatusCondition,
  appendThemeJoinCondition,
  appendTitleSynonymsSearchConditions,
  buildAndWhereClause,
  buildReviewListCommonOrderBy,
  listSkipTake
} from "@/common/crud/media-review-list-query";

import { LightNovelQueryDto } from "@/light-novel/dto";

@Injectable()
export class LightNovelQueryBuilder implements CrudQueryBuilder {
  buildFindAllQuery(query: LightNovelQueryDto): CrudQueryResult {
    const conditions: Record<string, unknown>[] = [];

    appendTitleSynonymsSearchConditions(conditions, query.query);
    appendAuthorJoinCondition(conditions, query.author);
    appendGenreJoinCondition(conditions, query.genre);
    appendThemeJoinCondition(conditions, query.theme);
    appendReviewProgressStatusCondition(conditions, query.status);
    appendMalAndPersonalScoreRangeConditions(
      conditions,
      query.malScore,
      query.personalScore
    );

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

    const where = buildAndWhereClause(conditions);
    const orderBy = buildReviewListCommonOrderBy(
      query.sort,
      query.order,
      "nullsLast"
    );

    return {
      where,
      ...listSkipTake(query.page, query.limit),
      orderBy
    };
  }
}
