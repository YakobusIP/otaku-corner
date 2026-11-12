import type { INestApplication } from "@nestjs/common";

import { ProgressStatus } from "@prisma/client";
import request from "supertest";

import { authHeader, createTestApp, login } from "./create-test-app";
import { disconnectTestPrisma, resetDatabase } from "./reset-database";

const SEED_ANIME_ID = 920_001;
const SEED_MANGA_ID = 920_002;
const SEED_LIGHT_NOVEL_ID = 920_003;

const SEED_ANIME_TITLE = "E2E Public Read Anime 920001";
const SEED_MANGA_TITLE = "E2E Public Read Manga 920002";
const SEED_LIGHT_NOVEL_TITLE = "E2E Public Read LN 920003";
const SEED_GENRE = "E2E Public Genre";
const SEED_THEME = "E2E Public Theme";

const PLACEHOLDER_IMAGE = { image_url: "https://example.com/e2e-poster.jpg" };

type PaginatedAnimeResponse = {
  data: { id: number; slug: string; title: string }[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type SitemapAnimeRow = {
  id: number;
  slug: string;
  createdAt: string | null;
  updatedAt: string | null;
};

type MediaLibraryItem = {
  mediaType: "anime" | "manga" | "lightNovel";
  id: number;
  slug: string;
  title: string;
};

type PaginatedMediaLibraryResponse = {
  data: MediaLibraryItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type AllTimeStatisticsResponse = {
  allMediaCount: number;
  animeCount: number;
  mangaCount: number;
  lightNovelCount: number;
  averageMalScore: number;
  averagePersonalScore: number;
};

type AnimeTotalResponse = {
  count: number;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const parsePaginatedAnimeResponse = (body: unknown): PaginatedAnimeResponse => {
  if (!isRecord(body) || !Array.isArray(body.data)) {
    throw new Error("Invalid paginated anime response");
  }
  return body as PaginatedAnimeResponse;
};

const parseSitemapRows = (body: unknown): SitemapAnimeRow[] => {
  if (!Array.isArray(body)) {
    throw new Error("Invalid anime sitemap response");
  }
  return body as SitemapAnimeRow[];
};

const parseMediaLibraryResponse = (
  body: unknown
): PaginatedMediaLibraryResponse => {
  if (!isRecord(body) || !Array.isArray(body.data)) {
    throw new Error("Invalid media library response");
  }
  return body as PaginatedMediaLibraryResponse;
};

const parseAllTimeStatisticsResponse = (
  body: unknown
): AllTimeStatisticsResponse => {
  if (!isRecord(body)) {
    throw new Error("Invalid all-time statistics response");
  }
  const {
    allMediaCount,
    animeCount,
    mangaCount,
    lightNovelCount,
    averageMalScore,
    averagePersonalScore
  } = body;
  if (
    typeof allMediaCount !== "number" ||
    typeof animeCount !== "number" ||
    typeof mangaCount !== "number" ||
    typeof lightNovelCount !== "number" ||
    typeof averageMalScore !== "number" ||
    typeof averagePersonalScore !== "number"
  ) {
    throw new Error("Invalid all-time statistics response shape");
  }
  return {
    allMediaCount,
    animeCount,
    mangaCount,
    lightNovelCount,
    averageMalScore,
    averagePersonalScore
  };
};

const parseAnimeTotalResponse = (body: unknown): AnimeTotalResponse => {
  if (
    !isRecord(body) ||
    typeof body.count !== "number" ||
    !Number.isFinite(body.count)
  ) {
    throw new Error("Invalid anime total response");
  }
  return { count: body.count };
};

const seedLibrary = async (
  app: INestApplication,
  accessToken: string
): Promise<void> => {
  const headers = authHeader(accessToken);

  await request(app.getHttpServer())
    .post("/api/animes/bulk")
    .set(headers)
    .send({
      data: [
        {
          id: SEED_ANIME_ID,
          slug: "e2e-public-read-anime-920001",
          type: "Movie",
          status: "Finished Airing",
          rating: "PG-13",
          title: SEED_ANIME_TITLE,
          titleJapanese: "E2Eアニメ",
          titleSynonyms: "E2E Anime",
          source: "Original",
          aired: "Jan 1, 2020 to Jan 1, 2020",
          broadcast: "",
          duration: "90 min",
          score: 7.5,
          images: PLACEHOLDER_IMAGE,
          synopsis: "E2E public read flow anime.",
          malUrl: `https://myanimelist.net/anime/${SEED_ANIME_ID}`,
          genres: [SEED_GENRE],
          studios: ["E2E Public Studio"],
          themes: [SEED_THEME]
        }
      ]
    })
    .expect(201);

  await request(app.getHttpServer())
    .post("/api/mangas/bulk")
    .set(headers)
    .send({
      data: [
        {
          id: SEED_MANGA_ID,
          slug: "e2e-public-read-manga-920002",
          status: "Finished",
          title: SEED_MANGA_TITLE,
          titleJapanese: "E2Eマンガ",
          titleSynonyms: "E2E Manga",
          published: "Jan 1, 2020 to Jan 1, 2021",
          chaptersCount: 10,
          volumesCount: 1,
          score: 7.8,
          images: PLACEHOLDER_IMAGE,
          synopsis: "E2E public read flow manga.",
          malUrl: `https://myanimelist.net/manga/${SEED_MANGA_ID}`,
          authors: ["E2E Public Author"],
          genres: [SEED_GENRE],
          themes: [SEED_THEME]
        }
      ]
    })
    .expect(201);

  await request(app.getHttpServer())
    .post("/api/light-novels/bulk")
    .set(headers)
    .send({
      data: [
        {
          id: SEED_LIGHT_NOVEL_ID,
          slug: "e2e-public-read-ln-920003",
          status: "Finished",
          title: SEED_LIGHT_NOVEL_TITLE,
          titleJapanese: "E2Eラノベ",
          titleSynonyms: "E2E LN",
          published: "Jan 1, 2020 to Jan 1, 2021",
          volumesCount: 3,
          score: 7.2,
          images: PLACEHOLDER_IMAGE,
          synopsis: "E2E public read flow light novel.",
          malUrl: `https://myanimelist.net/manga/${SEED_LIGHT_NOVEL_ID}`,
          authors: ["E2E Public Author"],
          genres: [SEED_GENRE],
          themes: [SEED_THEME]
        }
      ]
    })
    .expect(201);

  await request(app.getHttpServer())
    .put(`/api/animes/${SEED_ANIME_ID}/review`)
    .set(headers)
    .send({ progressStatus: ProgressStatus.COMPLETED })
    .expect(200);

  await request(app.getHttpServer())
    .put(`/api/mangas/${SEED_MANGA_ID}/review`)
    .set(headers)
    .send({ progressStatus: ProgressStatus.COMPLETED })
    .expect(200);

  await request(app.getHttpServer())
    .put(`/api/light-novels/${SEED_LIGHT_NOVEL_ID}/review`)
    .set(headers)
    .send({ progressStatus: ProgressStatus.COMPLETED })
    .expect(200);
};

describe("Public read flows (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    await resetDatabase();
    app = await createTestApp();
    const accessToken = await login(app);
    await seedLibrary(app, accessToken);
  });

  afterAll(async () => {
    await app.close();
    await disconnectTestPrisma();
  });

  it("exposes seeded media through public read endpoints without auth", async () => {
    const animeListResponse = await request(app.getHttpServer())
      .get("/api/animes")
      .query({ query: SEED_ANIME_TITLE, page: 1, limit: 10 })
      .expect(200);

    const animeList = parsePaginatedAnimeResponse(animeListResponse.body);
    expect(
      animeList.data.some(
        (row) => row.id === SEED_ANIME_ID && row.title === SEED_ANIME_TITLE
      )
    ).toBe(true);

    const sitemapResponse = await request(app.getHttpServer())
      .get("/api/animes/sitemap")
      .query({ page: 1, limit: 10 })
      .expect(200);

    const sitemapRows = parseSitemapRows(sitemapResponse.body);
    const sitemapHit = sitemapRows.find((row) => row.id === SEED_ANIME_ID);
    expect(sitemapHit).toBeDefined();
    expect(sitemapHit?.slug).toBe("e2e-public-read-anime-920001");

    const mediaLibraryResponse = await request(app.getHttpServer())
      .get("/api/media-library")
      .query({ page: 1, limit: 50 })
      .expect(200);

    const mediaLibrary = parseMediaLibraryResponse(mediaLibraryResponse.body);
    expect(mediaLibrary.total).toBeGreaterThanOrEqual(3);
    expect(
      mediaLibrary.data.some(
        (item) => item.mediaType === "anime" && item.id === SEED_ANIME_ID
      )
    ).toBe(true);
    expect(
      mediaLibrary.data.some(
        (item) => item.mediaType === "manga" && item.id === SEED_MANGA_ID
      )
    ).toBe(true);
    expect(
      mediaLibrary.data.some(
        (item) =>
          item.mediaType === "lightNovel" && item.id === SEED_LIGHT_NOVEL_ID
      )
    ).toBe(true);

    const allTimeResponse = await request(app.getHttpServer())
      .get("/api/statistic/all-time")
      .expect(200);

    const allTime = parseAllTimeStatisticsResponse(allTimeResponse.body);
    expect(allTime.allMediaCount).toBeGreaterThanOrEqual(3);
    expect(allTime.animeCount).toBeGreaterThanOrEqual(1);
    expect(allTime.mangaCount).toBeGreaterThanOrEqual(1);
    expect(allTime.lightNovelCount).toBeGreaterThanOrEqual(1);

    const totalResponse = await request(app.getHttpServer())
      .get("/api/animes/total")
      .expect(200);

    const total = parseAnimeTotalResponse(totalResponse.body);
    expect(total.count).toBeGreaterThanOrEqual(1);
  });
});
