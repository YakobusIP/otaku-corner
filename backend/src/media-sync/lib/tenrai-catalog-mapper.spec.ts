import {
  mapTenraiAnimeToCatalog,
  mapTenraiLightNovelToCatalog,
  mapTenraiMangaToCatalog
} from "./tenrai-catalog-mapper";

const jpgOnlyImages = {
  jpg: {
    image_url: "https://cdn.example/a.jpg",
    large_image_url: "https://cdn.example/a-large.jpg",
    small_image_url: "https://cdn.example/a-small.jpg"
  }
};

const FROM_ISO = "2020-06-15T12:00:00.000Z";
const TO_ISO = "2021-03-10T12:00:00.000Z";
const FROM_LABEL = "Jun 15, 2020";
const TO_LABEL = "Mar 10, 2021";

const withJpgImages = (overrides: Record<string, unknown> = {}) => ({
  images: jpgOnlyImages,
  ...overrides
});

describe("mapTenraiAnimeToCatalog", () => {
  it("returns null for missing or non-object payloads", () => {
    expect(mapTenraiAnimeToCatalog(null)).toBeNull();
    expect(mapTenraiAnimeToCatalog(undefined)).toBeNull();
    expect(mapTenraiAnimeToCatalog("anime")).toBeNull();
  });

  it("returns null when images are missing or have no resolvable image_url", () => {
    expect(mapTenraiAnimeToCatalog({ title: "X" })).toBeNull();
    expect(
      mapTenraiAnimeToCatalog({ images: { jpg: {}, webp: {} } })
    ).toBeNull();
  });

  it("prefers webp image urls and falls back large and small urls to the primary url", () => {
    expect(
      mapTenraiAnimeToCatalog({
        images: {
          webp: { image_url: "https://cdn.example/w.webp" },
          jpg: { image_url: "https://cdn.example/j.jpg" }
        }
      })
    ).toMatchObject({
      images: {
        image_url: "https://cdn.example/w.webp",
        large_image_url: "https://cdn.example/w.webp",
        small_image_url: "https://cdn.example/w.webp"
      }
    });

    expect(mapTenraiAnimeToCatalog({ images: jpgOnlyImages })).toMatchObject({
      images: {
        image_url: "https://cdn.example/a.jpg",
        large_image_url: "https://cdn.example/a-large.jpg",
        small_image_url: "https://cdn.example/a-small.jpg"
      }
    });
  });

  it("maps ratings, season, synonyms, and string fallbacks for omitted scalars", () => {
    const result = mapTenraiAnimeToCatalog(
      withJpgImages({
        rating: "pg13",
        season: "winter",
        year: 2024,
        title_synonyms: ["Alt Title", "OTHER"],
        type: "Movie",
        status: "Finished Airing"
      })
    );

    expect(result).toMatchObject({
      rating: "PG-13 - Teens 13 or older",
      season: "WINTER 2024",
      titleSynonyms: "alt title other",
      type: "Movie",
      status: "Finished Airing",
      title: "",
      titleJapanese: "",
      source: "",
      duration: "",
      malUrl: "",
      broadcast: "N/A",
      trailer: null
    });
    expect(result).not.toHaveProperty("mal_id");
    expect(result).not.toHaveProperty("genres");
  });

  it("returns Unrated for missing or unknown rating codes", () => {
    expect(mapTenraiAnimeToCatalog(withJpgImages())).toMatchObject({
      rating: "Unrated"
    });
    expect(
      mapTenraiAnimeToCatalog(withJpgImages({ rating: "unknown-code" }))
    ).toMatchObject({ rating: "Unrated" });
  });

  it("sets season to null when season is absent and trims season without year", () => {
    expect(
      mapTenraiAnimeToCatalog(withJpgImages({ season: "spring" }))
    ).toMatchObject({ season: "SPRING" });
    expect(mapTenraiAnimeToCatalog(withJpgImages())).toMatchObject({
      season: null
    });
  });

  it("formats non-TV aired dates from the from value only", () => {
    expect(
      mapTenraiAnimeToCatalog(
        withJpgImages({
          type: "Movie",
          aired: { from: FROM_ISO, to: "2021-01-01T12:00:00.000Z" }
        })
      )
    ).toMatchObject({ aired: FROM_LABEL });
  });

  it("returns status for TV entries that are not yet aired", () => {
    expect(
      mapTenraiAnimeToCatalog(
        withJpgImages({
          type: "TV",
          status: "Not yet aired",
          aired: { from: "2030-01-01T12:00:00.000Z" }
        })
      )
    ).toMatchObject({ aired: "Not yet aired" });
  });

  it("formats TV aired as a range with ? when dates are missing or invalid", () => {
    expect(
      mapTenraiAnimeToCatalog(
        withJpgImages({
          type: "TV",
          aired: { from: "not-a-date", to: null }
        })
      )
    ).toMatchObject({ aired: "? to ?" });

    expect(
      mapTenraiAnimeToCatalog(
        withJpgImages({
          type: "TV",
          aired: { from: FROM_ISO, to: "invalid" }
        })
      )
    ).toMatchObject({ aired: `${FROM_LABEL} to ?` });

    expect(
      mapTenraiAnimeToCatalog(
        withJpgImages({
          type: "TV",
          status: "Finished Airing",
          aired: { from: FROM_ISO, to: TO_ISO }
        })
      )
    ).toMatchObject({ aired: `${FROM_LABEL} to ${TO_LABEL}` });
  });

  it("maps episodes, score, synopsis, trailer, and broadcast branches", () => {
    expect(
      mapTenraiAnimeToCatalog(
        withJpgImages({
          broadcast: { string: "Sundays 00:00 (JST)" },
          episodes: 12.9,
          score: 8.25,
          synopsis: null,
          trailer: { embed_url: "https://youtube.com/embed/x?autoplay=1&rel=0" }
        })
      )
    ).toMatchObject({
      broadcast: "Sundays 00:00 (JST)",
      episodesCount: 12,
      score: 8.25,
      synopsis: "No synopsis available",
      trailer: "https://youtube.com/embed/x?autoplay=0&rel=0"
    });

    expect(
      mapTenraiAnimeToCatalog(
        withJpgImages({
          episodes: Number.NaN,
          score: "high"
        })
      )
    ).toMatchObject({
      episodesCount: null,
      score: null
    });
  });
});

describe("mapTenraiMangaToCatalog", () => {
  it("returns null for invalid payloads or unusable images", () => {
    expect(mapTenraiMangaToCatalog(0)).toBeNull();
    expect(mapTenraiMangaToCatalog({ images: null })).toBeNull();
  });

  it("maps published ranges and count floors", () => {
    expect(
      mapTenraiMangaToCatalog(
        withJpgImages({ published: { from: "bad", to: null } })
      )
    ).toMatchObject({ published: "—" });

    expect(
      mapTenraiMangaToCatalog(
        withJpgImages({ published: { from: FROM_ISO, to: null } })
      )
    ).toMatchObject({ published: `${FROM_LABEL} to ?` });

    expect(
      mapTenraiMangaToCatalog(
        withJpgImages({ published: { from: FROM_ISO, to: "not-a-date" } })
      )
    ).toMatchObject({ published: `${FROM_LABEL} to ?` });

    const ranged = mapTenraiMangaToCatalog(
      withJpgImages({
        published: { from: FROM_ISO, to: TO_ISO },
        title_synonyms: ["Foo", "BAR"],
        chapters: 100.2,
        volumes: 12.8,
        synopsis: "Story",
        url: "https://myanimelist.net/manga/1"
      })
    );

    expect(ranged).toMatchObject({
      published: `${FROM_LABEL} to ${TO_LABEL}`,
      chaptersCount: 100,
      volumesCount: 12,
      synopsis: "Story",
      malUrl: "https://myanimelist.net/manga/1",
      titleSynonyms: "foo bar"
    });
    expect(ranged).not.toHaveProperty("authors");
  });

  it("nulls non-numeric chapter and volume counts and missing synopsis", () => {
    expect(
      mapTenraiMangaToCatalog(
        withJpgImages({
          chapters: undefined,
          volumes: Number.NaN,
          synopsis: ""
        })
      )
    ).toMatchObject({
      chaptersCount: null,
      volumesCount: null,
      synopsis: "No synopsis available"
    });
  });
});

describe("mapTenraiLightNovelToCatalog", () => {
  it("returns null when the manga mapper rejects the payload", () => {
    expect(mapTenraiLightNovelToCatalog(null)).toBeNull();
  });

  it("drops chaptersCount and preserves volumesCount with null fallback", () => {
    const withVolumes = mapTenraiLightNovelToCatalog(
      withJpgImages({ volumes: 3, chapters: 40 })
    );

    expect(withVolumes).not.toHaveProperty("chaptersCount");
    expect(withVolumes).toMatchObject({ volumesCount: 3, status: "" });

    const withoutVolumes = mapTenraiLightNovelToCatalog(
      withJpgImages({ chapters: 10 })
    );

    expect(withoutVolumes).not.toHaveProperty("chaptersCount");
    expect(withoutVolumes).toMatchObject({ volumesCount: null });
  });
});
