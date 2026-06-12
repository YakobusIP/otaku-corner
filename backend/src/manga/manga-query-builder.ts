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

import { MangaQueryDto } from "@/manga/dto";

@Injectable()
export class MangaQueryBuilder implements CrudQueryBuilder {
  buildFindAllQuery(query: MangaQueryDto): CrudQueryResult {
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
        chaptersCount: { not: null },
        volumesCount: { not: null }
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
          { chaptersCount: null },
          { volumesCount: null },
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
