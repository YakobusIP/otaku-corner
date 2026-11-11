import { SCORE_RANGES } from "@/common/constants/progress-statuses";

import { ProgressStatus } from "@prisma/client";

import {
  appendAuthorJoinCondition,
  appendGenreJoinCondition,
  appendMalAndPersonalScoreRangeConditions,
  appendReviewProgressStatusCondition,
  appendStudioJoinCondition,
  appendThemeJoinCondition,
  appendTitleSynonymsSearchConditions,
  buildAndWhereClause,
  buildReviewListCommonOrderBy,
  listSkipTake
} from "./media-review-list-query";

type AppendRelation = (
  conditions: Record<string, unknown>[],
  id?: number
) => void;

describe("appendTitleSynonymsSearchConditions", () => {
  it("does nothing when text query is omitted", () => {
    const conditions: Record<string, unknown>[] = [];
    appendTitleSynonymsSearchConditions(conditions, undefined);
    expect(conditions).toEqual([]);
  });

  it("appends insensitive title and synonym OR search when text is provided", () => {
    const conditions: Record<string, unknown>[] = [];
    appendTitleSynonymsSearchConditions(conditions, "naruto");
    expect(conditions).toEqual([
      {
        OR: [
          { title: { contains: "naruto", mode: "insensitive" } },
          { titleSynonyms: { contains: "naruto", mode: "insensitive" } }
        ]
      }
    ]);
  });
});

describe.each([
  ["genre", appendGenreJoinCondition, 5, { genres: { some: { genreId: 5 } } }],
  ["theme", appendThemeJoinCondition, 7, { themes: { some: { themeId: 7 } } }],
  [
    "studio",
    appendStudioJoinCondition,
    2,
    { studios: { some: { studioId: 2 } } }
  ],
  [
    "author",
    appendAuthorJoinCondition,
    9,
    { authors: { some: { authorId: 9 } } }
  ]
] satisfies Array<[string, AppendRelation, number, Record<string, unknown>]>)(
  "append %s join condition",
  (_label, append, id, expected) => {
    it("does nothing when the id is omitted", () => {
      const conditions: Record<string, unknown>[] = [];
      append(conditions, undefined);
      expect(conditions).toEqual([]);
    });

    it("appends the relation filter when the id is provided", () => {
      const conditions: Record<string, unknown>[] = [];
      append(conditions, id);
      expect(conditions).toEqual([expected]);
    });
  }
);

describe("appendReviewProgressStatusCondition", () => {
  it("does nothing when progress status is omitted", () => {
    const conditions: Record<string, unknown>[] = [];
    appendReviewProgressStatusCondition(conditions, undefined);
    expect(conditions).toEqual([]);
  });

  it("appends review progress status filter when status is provided", () => {
    const conditions: Record<string, unknown>[] = [];
    appendReviewProgressStatusCondition(conditions, ProgressStatus.COMPLETED);
    expect(conditions).toEqual([
      { review: { progressStatus: ProgressStatus.COMPLETED } }
    ]);
  });
});

describe("appendMalAndPersonalScoreRangeConditions", () => {
  it("skips unknown score range keys", () => {
    const conditions: Record<string, unknown>[] = [];
    appendMalAndPersonalScoreRangeConditions(
      conditions,
      "invalid",
      "not-a-range"
    );
    expect(conditions).toEqual([]);
  });

  it("appends MAL score range when malScore key is valid", () => {
    const conditions: Record<string, unknown>[] = [];
    appendMalAndPersonalScoreRangeConditions(conditions, "good", undefined);
    expect(conditions).toEqual([
      {
        score: {
          gte: SCORE_RANGES.good.min,
          lte: SCORE_RANGES.good.max
        }
      }
    ]);
  });

  it("appends personal score range on review when personalScore key is valid", () => {
    const conditions: Record<string, unknown>[] = [];
    appendMalAndPersonalScoreRangeConditions(
      conditions,
      undefined,
      "excellent"
    );
    expect(conditions).toEqual([
      {
        review: {
          personalScore: {
            gte: SCORE_RANGES.excellent.min,
            lte: SCORE_RANGES.excellent.max
          }
        }
      }
    ]);
  });

  it("appends both MAL and personal ranges when both keys are valid", () => {
    const conditions: Record<string, unknown>[] = [];
    appendMalAndPersonalScoreRangeConditions(conditions, "poor", "average");
    expect(conditions).toEqual([
      {
        score: { gte: SCORE_RANGES.poor.min, lte: SCORE_RANGES.poor.max }
      },
      {
        review: {
          personalScore: {
            gte: SCORE_RANGES.average.min,
            lte: SCORE_RANGES.average.max
          }
        }
      }
    ]);
  });
});

describe("listSkipTake", () => {
  it("defaults to page 1 and limit 10 when pagination is omitted", () => {
    expect(listSkipTake(undefined, undefined)).toEqual({ skip: 0, take: 10 });
  });

  it("computes skip from page and limit", () => {
    expect(listSkipTake(3, 25)).toEqual({ skip: 50, take: 25 });
  });
});

describe("buildAndWhereClause", () => {
  it("returns empty object when there are no conditions", () => {
    expect(buildAndWhereClause([])).toEqual({});
  });

  it("wraps conditions in AND when list is non-empty", () => {
    const a = { deletedAt: null };
    const b = { title: "x" };
    expect(buildAndWhereClause([a, b])).toEqual({ AND: [a, b] });
  });
});

describe("buildReviewListCommonOrderBy", () => {
  it("returns undefined for unrecognized sort fields", () => {
    expect(buildReviewListCommonOrderBy("updatedAt", "asc")).toBeUndefined();
  });

  it("orders by title descending when order is not asc", () => {
    expect(buildReviewListCommonOrderBy("title", "desc")).toEqual({
      title: "desc"
    });
  });

  it("orders by title descending when order is omitted", () => {
    expect(buildReviewListCommonOrderBy("title", undefined)).toEqual({
      title: "desc"
    });
  });

  it("orders by title ascending when order is asc", () => {
    expect(buildReviewListCommonOrderBy("title", "asc")).toEqual({
      title: "asc"
    });
  });

  it("orders by MAL score with sort direction", () => {
    expect(buildReviewListCommonOrderBy("score", "asc")).toEqual({
      score: "asc"
    });
  });

  it("orders by personal score on review in default mode", () => {
    expect(buildReviewListCommonOrderBy("personal_score", "desc")).toEqual({
      review: { personalScore: "desc" }
    });
  });

  it("orders by personal score with nulls last when mode is nullsLast", () => {
    expect(
      buildReviewListCommonOrderBy("personal_score", "asc", "nullsLast")
    ).toEqual({
      review: { personalScore: { sort: "asc", nulls: "last" } }
    });
  });
});
