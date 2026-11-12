import type { INestApplication } from "@nestjs/common";

import request from "supertest";

import {
  authHeader,
  clearSettingsCache,
  createTestApp,
  login
} from "./create-test-app";
import { disconnectTestPrisma, resetDatabase } from "./reset-database";

const ANIME_ID = 910_001;
const MANGA_ID = 910_002;
const LIGHT_NOVEL_ID = 910_003;

const PLACEHOLDER_IMAGES = { image_url: "https://example.com/e2e-poster.jpg" };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const expectNumber = (value: unknown, label: string): number => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new Error(`Expected ${label} to be a number`);
  }
  return value;
};

const readTitle = (body: unknown): string => {
  if (!isRecord(body) || typeof body.title !== "string") {
    throw new Error("Detail response did not include a string title");
  }
  return body.title;
};

const readPersonalScore = (body: unknown): number => {
  if (!isRecord(body)) {
    throw new Error("Review response was not an object");
  }
  return expectNumber(body.personalScore, "personalScore");
};

const readMangaCounts = (
  body: unknown
): { chaptersCount: number; volumesCount: number } => {
  if (!isRecord(body)) {
    throw new Error("Manga detail response was not an object");
  }
  return {
    chaptersCount: expectNumber(body.chaptersCount, "chaptersCount"),
    volumesCount: expectNumber(body.volumesCount, "volumesCount")
  };
};

type VolumeProgressRow = {
  id: number;
  volumeNumber: number;
  consumedAt: string | null;
};

const readVolumeProgress = (body: unknown): VolumeProgressRow[] => {
  if (!isRecord(body) || !Array.isArray(body.volumeProgress)) {
    throw new Error("Light novel detail did not include volumeProgress array");
  }
  return body.volumeProgress.map((row, index) => {
    if (!isRecord(row)) {
      throw new Error(`volumeProgress[${index}] was not an object`);
    }
    const consumedAt = row.consumedAt;
    if (consumedAt !== null && typeof consumedAt !== "string") {
      throw new Error(`volumeProgress[${index}].consumedAt was invalid`);
    }
    return {
      id: expectNumber(row.id, `volumeProgress[${index}].id`),
      volumeNumber: expectNumber(
        row.volumeNumber,
        `volumeProgress[${index}].volumeNumber`
      ),
      consumedAt
    };
  });
};

describe("Media writes (e2e)", () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    await resetDatabase();
    app = await createTestApp();
    token = await login(app);
  });

  afterAll(async () => {
    await app.close();
    await disconnectTestPrisma();
  });

  it("creates a Movie anime, updates review, deletes it, and hides it from the public API", async () => {
    const animeTitle = "E2E Media Writes Anime Movie";
    const animeSlug = "e2e-media-writes-anime-910001";

    await request(app.getHttpServer())
      .post("/api/animes/bulk")
      .set(authHeader(token))
      .send({
        data: [
          {
            id: ANIME_ID,
            slug: animeSlug,
            type: "Movie",
            status: "Finished Airing",
            rating: "PG-13",
            title: animeTitle,
            titleJapanese: "メディアライト映画",
            titleSynonyms: "E2E Anime",
            source: "Original",
            aired: "Jan 1, 2020",
            broadcast: "",
            duration: "120 min",
            synopsis: "End-to-end anime write flow.",
            images: PLACEHOLDER_IMAGES,
            malUrl: `https://myanimelist.net/anime/${ANIME_ID}/E2E`,
            genres: ["Action", "Drama"],
            studios: ["E2E Studio"],
            themes: ["School"]
          }
        ]
      })
      .expect(201);

    const publicDetail = await request(app.getHttpServer())
      .get(`/api/animes/${ANIME_ID}`)
      .expect(200);

    expect(readTitle(publicDetail.body)).toBe(animeTitle);

    const reviewResponse = await request(app.getHttpServer())
      .put(`/api/animes/${ANIME_ID}/review`)
      .set(authHeader(token))
      .send({
        storylineRating: 8,
        qualityRating: 9,
        voiceActingRating: 7,
        soundTrackRating: 10,
        charDevelopmentRating: 6
      })
      .expect(200);

    const personalScore = readPersonalScore(reviewResponse.body);
    expect(personalScore).toBe(8.15);

    await request(app.getHttpServer())
      .delete(`/api/animes/${ANIME_ID}`)
      .set(authHeader(token))
      .expect(204);

    await request(app.getHttpServer())
      .get(`/api/animes/${ANIME_ID}`)
      .expect(404);
  });

  it("creates manga via bulk and exposes chapter and volume counts on public detail", async () => {
    clearSettingsCache(app);

    const mangaTitle = "E2E Media Writes Manga";
    const mangaSlug = "e2e-media-writes-manga-910002";
    const chaptersCount = 42;
    const volumesCount = 7;

    await request(app.getHttpServer())
      .post("/api/mangas/bulk")
      .set(authHeader(token))
      .send({
        data: [
          {
            id: MANGA_ID,
            slug: mangaSlug,
            status: "Finished",
            title: mangaTitle,
            titleJapanese: "メディアライト漫画",
            titleSynonyms: "E2E Manga",
            published: "Jan 1, 2010 to Dec 31, 2015",
            chaptersCount,
            volumesCount,
            synopsis: "End-to-end manga write flow.",
            images: PLACEHOLDER_IMAGES,
            malUrl: `https://myanimelist.net/manga/${MANGA_ID}/E2E`,
            authors: ["E2E Author"],
            genres: ["Action"],
            themes: ["Military"]
          }
        ]
      })
      .expect(201);

    const detail = await request(app.getHttpServer())
      .get(`/api/mangas/${MANGA_ID}`)
      .expect(200);

    expect(readTitle(detail.body)).toBe(mangaTitle);
    const counts = readMangaCounts(detail.body);
    expect(counts.chaptersCount).toBe(chaptersCount);
    expect(counts.volumesCount).toBe(volumesCount);
  });

  it("creates a light novel, updates volume progress, and reflects it on public detail", async () => {
    clearSettingsCache(app);

    const lnTitle = "E2E Media Writes Light Novel";
    const lnSlug = "e2e-media-writes-ln-910003";
    const volumesCount = 3;
    const consumedAt = "2024-06-15T00:00:00.000Z";

    await request(app.getHttpServer())
      .post("/api/light-novels/bulk")
      .set(authHeader(token))
      .send({
        data: [
          {
            id: LIGHT_NOVEL_ID,
            slug: lnSlug,
            status: "Publishing",
            title: lnTitle,
            titleJapanese: "メディアライト小説",
            titleSynonyms: "E2E LN",
            published: "Jan 1, 2018 to ?",
            volumesCount,
            synopsis: "End-to-end light novel write flow.",
            images: PLACEHOLDER_IMAGES,
            malUrl: `https://myanimelist.net/manga/${LIGHT_NOVEL_ID}/E2E`,
            authors: ["E2E Author"],
            genres: ["Fantasy"],
            themes: ["Isekai"]
          }
        ]
      })
      .expect(201);

    const beforeProgress = await request(app.getHttpServer())
      .get(`/api/light-novels/${LIGHT_NOVEL_ID}`)
      .expect(200);

    expect(readTitle(beforeProgress.body)).toBe(lnTitle);
    const progressRows = readVolumeProgress(beforeProgress.body);
    expect(progressRows).toHaveLength(volumesCount);
    expect(progressRows.every((row) => row.consumedAt === null)).toBe(true);

    const firstVolume = progressRows.find((row) => row.volumeNumber === 1);
    if (!firstVolume) {
      throw new Error("Volume 1 progress row was not created");
    }

    await request(app.getHttpServer())
      .put("/api/light-novels/volume-progress")
      .set(authHeader(token))
      .send({
        data: [
          {
            id: firstVolume.id,
            consumedAt
          }
        ]
      })
      .expect(200);

    const afterProgress = await request(app.getHttpServer())
      .get(`/api/light-novels/${LIGHT_NOVEL_ID}`)
      .expect(200);

    const updatedRows = readVolumeProgress(afterProgress.body);
    const updatedVolumeOne = updatedRows.find((row) => row.volumeNumber === 1);
    if (!updatedVolumeOne) {
      throw new Error("Volume 1 progress row missing after update");
    }
    expect(updatedVolumeOne.consumedAt).not.toBeNull();
    expect(String(updatedVolumeOne.consumedAt)).toContain("2024-06-15");
  });
});
