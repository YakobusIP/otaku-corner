import { MangaQueryBuilder } from "./manga-query-builder";
import { notDeletedMediaWhere } from "@/common/media/not-deleted-media-where";

describe("MangaQueryBuilder", () => {
  const builder = new MangaQueryBuilder();

  it("adds complete statusCheck filters for counts and review completion", () => {
    const result = builder.buildFindAllQuery({ statusCheck: "complete" });

    expect(result.where).toEqual({
      AND: [
        notDeletedMediaWhere,
        {
          chaptersCount: { not: null },
          volumesCount: { not: null }
        },
        {
          review: {
            reviewText: { not: null },
            consumedAt: { not: null }
          }
        }
      ]
    });
    expect(result.skip).toBe(0);
    expect(result.take).toBe(10);
    expect(result.orderBy).toBeUndefined();
  });

  it("adds incomplete statusCheck OR for missing counts or incomplete review", () => {
    const result = builder.buildFindAllQuery({ statusCheck: "incomplete" });

    expect(result.where).toEqual({
      AND: [
        notDeletedMediaWhere,
        {
          OR: [
            { chaptersCount: null },
            { volumesCount: null },
            {
              review: {
                OR: [{ reviewText: null }, { consumedAt: null }]
              }
            }
          ]
        }
      ]
    });
    expect(result.skip).toBe(0);
    expect(result.take).toBe(10);
    expect(result.orderBy).toBeUndefined();
  });
});
