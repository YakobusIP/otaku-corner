import {
  ANIME_CATALOG_FIELDS,
  LIGHT_NOVEL_CATALOG_FIELDS,
  MANGA_CATALOG_FIELDS,
  catalogFieldsForMediaType,
  getFieldBaseline,
  pickBaselineFieldUpdates,
  pickCatalogFields
} from "./catalog-sync-fields";

describe("catalogFieldsForMediaType", () => {
  it("returns the anime field list for ANIME", () => {
    expect(catalogFieldsForMediaType("ANIME")).toBe(ANIME_CATALOG_FIELDS);
    expect(catalogFieldsForMediaType("ANIME")).toContain("trailer");
    expect(catalogFieldsForMediaType("ANIME")).toContain("episodesCount");
  });

  it("returns the manga field list for MANGA", () => {
    expect(catalogFieldsForMediaType("MANGA")).toBe(MANGA_CATALOG_FIELDS);
    expect(catalogFieldsForMediaType("MANGA")).toContain("chaptersCount");
    expect(catalogFieldsForMediaType("MANGA")).not.toContain("trailer");
  });

  it("returns the light novel field list without chaptersCount", () => {
    expect(catalogFieldsForMediaType("LIGHT_NOVEL")).toBe(
      LIGHT_NOVEL_CATALOG_FIELDS
    );
    expect(catalogFieldsForMediaType("LIGHT_NOVEL")).toContain("volumesCount");
    expect(catalogFieldsForMediaType("LIGHT_NOVEL")).not.toContain(
      "chaptersCount"
    );
  });

  it("returns undefined for an unexpected media type at runtime", () => {
    expect(
      catalogFieldsForMediaType("COMIC" as "ANIME")
    ).toBeUndefined();
  });
});

describe("pickCatalogFields", () => {
  it("copies only listed keys that exist on the record and normalizes nullish values to null", () => {
    const picked = pickCatalogFields(
      {
        title: "Example",
        score: 0,
        trailer: undefined,
        extra: "ignored"
      },
      ["title", "score", "trailer", "synopsis"]
    );

    expect(picked).toEqual({
      title: "Example",
      score: 0,
      trailer: null
    });
    expect(picked).not.toHaveProperty("extra");
    expect(picked).not.toHaveProperty("synopsis");
  });
});

describe("getFieldBaseline", () => {
  it("returns undefined when the baseline row or field key is absent", () => {
    expect(getFieldBaseline(null, "score")).toBeUndefined();
    expect(getFieldBaseline({}, "score")).toBeUndefined();
  });

  it("returns null when the baseline stores an explicit null", () => {
    expect(getFieldBaseline({ score: null }, "score")).toBeNull();
  });

  it("returns a stored value when the baseline defines the field", () => {
    expect(getFieldBaseline({ score: 7.5, title: "Example" }, "score")).toBe(
      7.5
    );
  });
});

describe("pickBaselineFieldUpdates", () => {
  it("keeps only whitelisted keys that are own properties on the updates object", () => {
    const updates = Object.create({ inherited: "skip" }) as Record<
      string,
      unknown
    >;
    updates.title = "New title";
    updates.score = null;
    updates.notes = "local-only";

    const picked = pickBaselineFieldUpdates(updates, [
      "title",
      "score",
      "status"
    ]);

    expect(picked).toEqual({
      title: "New title",
      score: null
    });
    expect(picked).not.toHaveProperty("notes");
    expect(picked).not.toHaveProperty("inherited");
  });
});
