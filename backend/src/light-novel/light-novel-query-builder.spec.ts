import { LightNovelQueryBuilder } from "./light-novel-query-builder";
import { notDeletedMediaWhere } from "@/common/media/not-deleted-media-where";

describe("LightNovelQueryBuilder", () => {
  const builder = new LightNovelQueryBuilder();

  it("adds complete statusCheck filters for volumes, review, and volume progress", () => {
    const result = builder.buildFindAllQuery({ statusCheck: "complete" });

    expect(result.where).toEqual({
      AND: [
        notDeletedMediaWhere,
        {
          volumesCount: { not: null },
          review: {
            reviewText: { not: null },
            progressStatus: { not: "DROPPED" }
          },
          volumeProgress: { every: { consumedAt: { not: null } } }
        }
      ]
    });
    expect(result.skip).toBe(0);
    expect(result.take).toBe(10);
    expect(result.orderBy).toBeUndefined();
  });

  it("adds incomplete statusCheck OR for volumes, review, dropped, or unconsumed volumes", () => {
    const result = builder.buildFindAllQuery({ statusCheck: "incomplete" });

    expect(result.where).toEqual({
      AND: [
        notDeletedMediaWhere,
        {
          OR: [
            { volumesCount: null },
            { review: { reviewText: null } },
            { review: { progressStatus: "DROPPED" } },
            { volumeProgress: { some: { consumedAt: null } } }
          ]
        }
      ]
    });
    expect(result.skip).toBe(0);
    expect(result.take).toBe(10);
    expect(result.orderBy).toBeUndefined();
  });

  it("uses nullsLast personal score ordering for light novel lists", () => {
    const result = builder.buildFindAllQuery({
      sort: "personal_score",
      order: "asc"
    });

    expect(result.where).toEqual({ AND: [notDeletedMediaWhere] });
    expect(result.skip).toBe(0);
    expect(result.take).toBe(10);
    expect(result.orderBy).toEqual({
      review: { personalScore: { sort: "asc", nulls: "last" } }
    });
  });
});
