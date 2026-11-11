import { AnimeQueryBuilder } from "./anime-query-builder";
import { notDeletedMediaWhere } from "@/common/media/not-deleted-media-where";

describe("AnimeQueryBuilder", () => {
  const builder = new AnimeQueryBuilder();

  it("returns baseline list query with not-deleted filter and default pagination", () => {
    const result = builder.buildFindAllQuery({});

    expect(result).toEqual({
      where: { AND: [notDeletedMediaWhere] },
      skip: 0,
      take: 10,
      orderBy: undefined
    });
  });

  it("adds anime type filter when type is provided", () => {
    const result = builder.buildFindAllQuery({ type: "TV" });

    expect(result).toEqual({
      where: { AND: [notDeletedMediaWhere, { type: "TV" }] },
      skip: 0,
      take: 10,
      orderBy: undefined
    });
  });

  it("adds complete statusCheck filters for episodes and review fields", () => {
    const result = builder.buildFindAllQuery({ statusCheck: "complete" });

    expect(result.where).toEqual({
      AND: [
        notDeletedMediaWhere,
        {
          OR: [{ type: { in: ["Movie", "OVA"] } }, { episodes: { some: {} } }]
        },
        {
          review: {
            reviewText: { not: null },
            consumedAt: { not: null }
          }
        }
      ]
    });
  });

  it("adds incomplete statusCheck filters for missing episodes or incomplete review", () => {
    const result = builder.buildFindAllQuery({ statusCheck: "incomplete" });

    expect(result.where).toEqual({
      AND: [
        notDeletedMediaWhere,
        {
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
        }
      ]
    });
  });
});
