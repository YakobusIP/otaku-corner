import { SCORE_RANGES } from "@/common/constants/progress-statuses";

import { listMediaLibraryItems } from "@prisma/client/sql";

import { MediaLibraryService } from "./media-library.service";

jest.mock("@prisma/client/sql", () => ({
  listMediaLibraryItems: jest.fn()
}));

const listMediaLibraryItemsMock = jest.mocked(listMediaLibraryItems);

type SqlParams = {
  status: unknown;
  malScoreMin: unknown;
  malScoreMax: unknown;
  personalScoreMin: unknown;
  personalScoreMax: unknown;
  statusCheck: unknown;
  sort: unknown;
  order: unknown;
  limit: unknown;
  offset: unknown;
  genreId: unknown;
  studioId: unknown;
  themeId: unknown;
  authorId: unknown;
  animeType: unknown;
  searchQuery: unknown;
};

const sqlParams = (callIndex = 0): SqlParams => {
  const [
    status,
    malScoreMin,
    malScoreMax,
    personalScoreMin,
    personalScoreMax,
    statusCheck,
    sort,
    order,
    limit,
    offset,
    genreId,
    studioId,
    themeId,
    authorId,
    animeType,
    searchQuery
  ] = listMediaLibraryItemsMock.mock.calls[callIndex] ?? [];

  return {
    status,
    malScoreMin,
    malScoreMax,
    personalScoreMin,
    personalScoreMax,
    statusCheck,
    sort,
    order,
    limit,
    offset,
    genreId,
    studioId,
    themeId,
    authorId,
    animeType,
    searchQuery
  };
};

const libraryRow = (overrides: Record<string, unknown>) => ({
  titleJapanese: "",
  images: {},
  status: "",
  type: null,
  score: null,
  season: null,
  aired: null,
  rating: null,
  chaptersCount: null,
  volumesCount: null,
  reviewText: null,
  progressStatus: null,
  personalScore: null,
  consumedAt: null,
  fetchedEpisode: null,
  volumeProgress: null,
  totalCount: 3,
  ...overrides
});

describe("MediaLibraryService", () => {
  let queryRawTyped: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    queryRawTyped = jest.fn().mockResolvedValue([]);
    listMediaLibraryItemsMock.mockReturnValue({ sql: "list" } as never);
  });

  const createService = () =>
    new MediaLibraryService({ $queryRawTyped: queryRawTyped } as never);

  it("uses default page 1, limit 10, and offset 0 when pagination is omitted", async () => {
    const service = createService();

    const result = await service.findAll({});

    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
    expect(result.totalPages).toBe(0);
    expect(queryRawTyped).toHaveBeenCalledWith({ sql: "list" });
    expect(sqlParams()).toMatchObject({ limit: 10, offset: 0 });
  });

  it("passes desc order to the SQL helper when order is desc", async () => {
    const service = createService();

    await service.findAll({ order: "desc" });

    expect(sqlParams().order).toBe("desc");
  });

  it("passes asc order when order is omitted or not desc", async () => {
    const service = createService();

    await service.findAll({ order: "asc" });
    expect(sqlParams().order).toBe("asc");

    jest.clearAllMocks();
    await service.findAll({});
    expect(sqlParams().order).toBe("asc");
  });

  it("normalizes sort to score, personal_score, or title as fallback", async () => {
    const service = createService();

    await service.findAll({ sort: "score" });
    expect(sqlParams().sort).toBe("score");

    jest.clearAllMocks();
    await service.findAll({ sort: "personal_score" });
    expect(sqlParams().sort).toBe("personal_score");

    jest.clearAllMocks();
    await service.findAll({ sort: "unknown" });
    expect(sqlParams().sort).toBe("title");
  });

  it.each(Object.entries(SCORE_RANGES))(
    "maps malScore key %s to SQL min and max bounds",
    async (key, range) => {
      const service = createService();

      await service.findAll({ malScore: key });

      expect(sqlParams()).toMatchObject({
        malScoreMin: range.min,
        malScoreMax: range.max
      });
    }
  );

  it("passes null MAL bounds when malScore key is missing or unknown", async () => {
    const service = createService();

    await service.findAll({});
    expect(sqlParams()).toMatchObject({ malScoreMin: null, malScoreMax: null });

    jest.clearAllMocks();
    await service.findAll({ malScore: "not-a-range" });
    expect(sqlParams()).toMatchObject({ malScoreMin: null, malScoreMax: null });
  });

  it("maps personalScore keys through the same score range helper", async () => {
    const service = createService();

    await service.findAll({ personalScore: "good" });

    expect(sqlParams()).toMatchObject({
      personalScoreMin: SCORE_RANGES.good.min,
      personalScoreMax: SCORE_RANGES.good.max
    });
  });

  it("passes complete statusCheck to the SQL helper", async () => {
    const service = createService();

    await service.findAll({ statusCheck: "complete" });

    expect(sqlParams().statusCheck).toBe("complete");
  });

  it("passes incomplete statusCheck to the SQL helper", async () => {
    const service = createService();

    await service.findAll({ statusCheck: "incomplete" });

    expect(sqlParams().statusCheck).toBe("incomplete");
  });

  it("passes null statusCheck when the value is not recognized", async () => {
    const service = createService();

    await service.findAll({ statusCheck: "pending" });

    expect(sqlParams().statusCheck).toBeNull();
  });

  it("passes null searchQuery when query is blank or whitespace", async () => {
    const service = createService();

    await service.findAll({ query: "   " });
    expect(sqlParams().searchQuery).toBeNull();

    jest.clearAllMocks();
    await service.findAll({ query: "" });
    expect(sqlParams().searchQuery).toBeNull();
  });

  it("passes trimmed searchQuery when query has non-blank text", async () => {
    const service = createService();

    await service.findAll({ query: "  naruto  " });

    expect(sqlParams().searchQuery).toBe("naruto");
  });

  it("recounts total on page greater than 1 when the page query returns no rows", async () => {
    queryRawTyped
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ totalCount: 25 }]);

    const service = createService();

    const result = await service.findAll({ page: 2, limit: 10 });

    expect(queryRawTyped).toHaveBeenCalledTimes(2);
    expect(listMediaLibraryItemsMock).toHaveBeenCalledTimes(2);

    const {
      limit: firstLimit,
      offset: firstOffset,
      ...firstFilters
    } = sqlParams(0);
    const {
      limit: secondLimit,
      offset: secondOffset,
      ...secondFilters
    } = sqlParams(1);
    expect(secondFilters).toEqual(firstFilters);
    expect(firstLimit).toBe(10);
    expect(firstOffset).toBe(10);
    expect(secondLimit).toBe(1);
    expect(secondOffset).toBe(0);
    expect(result.total).toBe(25);
    expect(result.totalPages).toBe(3);
    expect(result.data).toEqual([]);
  });

  it("maps anime, manga, and light novel SQL rows to list DTOs with fallbacks", async () => {
    const consumedAt = new Date("2024-06-01T00:00:00.000Z");
    queryRawTyped.mockResolvedValue([
      libraryRow({
        mediaType: "anime",
        id: 1,
        slug: "anime-one",
        title: "Anime One",
        titleJapanese: "アニメ",
        images: { poster: "a.webp" },
        status: "Finished Airing",
        score: 8.2,
        season: "SPRING",
        reviewText: "Great",
        progressStatus: "COMPLETED",
        personalScore: 9,
        consumedAt
      }),
      libraryRow({
        mediaType: "manga",
        id: 2,
        slug: "manga-one",
        title: "Manga One",
        titleJapanese: "漫画",
        images: { poster: "m.webp" },
        status: "Publishing",
        score: 7.5,
        chaptersCount: 100,
        volumesCount: 12
      }),
      libraryRow({
        mediaType: "lightNovel",
        id: 3,
        slug: "ln-one",
        title: "LN One",
        titleJapanese: "小説",
        images: { poster: "l.webp" },
        status: "Publishing",
        score: 8,
        volumesCount: 5,
        reviewText: "Solid",
        progressStatus: "ON_PROGRESS",
        personalScore: 8,
        volumeProgress: [{ volumeNumber: 1, consumedAt: null }]
      })
    ]);

    const service = createService();
    const result = await service.findAll({ page: 1, limit: 10 });

    expect(listMediaLibraryItemsMock).toHaveBeenCalledTimes(1);
    expect(sqlParams()).toMatchObject({
      sort: "title",
      order: "asc",
      limit: 10,
      offset: 0
    });

    expect(result.total).toBe(3);
    expect(result.data).toHaveLength(3);

    expect(result.data[0]).toMatchObject({
      mediaType: "anime",
      type: "",
      aired: "",
      rating: "",
      fetchedEpisode: 0,
      progressStatus: "COMPLETED"
    });

    expect(result.data[1]).toMatchObject({
      mediaType: "manga",
      chaptersCount: 100,
      volumesCount: 12,
      progressStatus: null,
      personalScore: null,
      consumedAt: null
    });

    expect(result.data[2]).toMatchObject({
      mediaType: "lightNovel",
      volumesCount: 5,
      progressStatus: "ON_PROGRESS",
      volumeProgress: [{ volumeNumber: 1, consumedAt: null }]
    });
  });
});
