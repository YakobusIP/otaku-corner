import { SCORE_RANGES } from "@/common/constants/progress-statuses";

import { ProgressStatus } from "@prisma/client";

export const appendTitleSynonymsSearchConditions = (
  conditions: Record<string, unknown>[],
  textQuery?: string
): void => {
  if (!textQuery) {
    return;
  }
  conditions.push({
    OR: [
      { title: { contains: textQuery, mode: "insensitive" } },
      { titleSynonyms: { contains: textQuery, mode: "insensitive" } }
    ]
  });
};

export const appendGenreJoinCondition = (
  conditions: Record<string, unknown>[],
  genreId?: number
): void => {
  if (!genreId) {
    return;
  }
  conditions.push({
    genres: { some: { genreId } }
  });
};

export const appendThemeJoinCondition = (
  conditions: Record<string, unknown>[],
  themeId?: number
): void => {
  if (!themeId) {
    return;
  }
  conditions.push({
    themes: { some: { themeId } }
  });
};

export const appendStudioJoinCondition = (
  conditions: Record<string, unknown>[],
  studioId?: number
): void => {
  if (!studioId) {
    return;
  }
  conditions.push({
    studios: { some: { studioId } }
  });
};

export const appendAuthorJoinCondition = (
  conditions: Record<string, unknown>[],
  authorId?: number
): void => {
  if (!authorId) {
    return;
  }
  conditions.push({
    authors: { some: { authorId } }
  });
};

export const appendReviewProgressStatusCondition = (
  conditions: Record<string, unknown>[],
  status?: ProgressStatus
): void => {
  if (!status) {
    return;
  }
  conditions.push({
    review: { progressStatus: status }
  });
};

export const appendMalAndPersonalScoreRangeConditions = (
  conditions: Record<string, unknown>[],
  malScore?: string,
  personalScore?: string
): void => {
  if (malScore && SCORE_RANGES[malScore]) {
    const range = SCORE_RANGES[malScore];
    conditions.push({
      score: { gte: range.min, lte: range.max }
    });
  }
  if (personalScore && SCORE_RANGES[personalScore]) {
    const range = SCORE_RANGES[personalScore];
    conditions.push({
      review: { personalScore: { gte: range.min, lte: range.max } }
    });
  }
};

export const listSkipTake = (
  page?: number,
  limit?: number
): { skip: number; take: number } => {
  const resolvedPage = page ?? 1;
  const resolvedLimit = limit ?? 10;
  return {
    skip: (resolvedPage - 1) * resolvedLimit,
    take: resolvedLimit
  };
};

export const buildAndWhereClause = (
  conditions: Record<string, unknown>[]
): Record<string, unknown> =>
  conditions.length > 0 ? { AND: conditions } : {};

export type ReviewListPersonalScoreSortMode = "default" | "nullsLast";

export const buildReviewListCommonOrderBy = (
  sort: string | undefined,
  order: string | undefined,
  personalScoreSort: ReviewListPersonalScoreSortMode = "default"
): Record<string, unknown> | undefined => {
  const direction = order === "asc" ? "asc" : "desc";

  switch (sort) {
    case "title":
      return { title: direction };
    case "score":
      return { score: direction };
    case "personal_score":
      if (personalScoreSort === "nullsLast") {
        return {
          review: {
            personalScore: { sort: direction, nulls: "last" }
          }
        };
      }
      return { review: { personalScore: direction } };
    default:
      return undefined;
  }
};
