import type { INestApplication } from "@nestjs/common";

import { REFRESH_TOKEN_COOKIE_NAME } from "@/auth/auth.constants";
import { MEDIA_CATALOG_SYNC_SETTING_KEY } from "@/settings/media-catalog-sync-setting";

import request from "supertest";

import {
  authHeader,
  clearSettingsCache,
  createTestApp,
  login
} from "./create-test-app";
import {
  disconnectTestPrisma,
  resetDatabase,
  TEST_PIN_1,
  TEST_PIN_2
} from "./reset-database";

const ANIME_WEIGHT_SEED = {
  storylineRating: 0.3,
  qualityRating: 0.25,
  voiceActingRating: 0.2,
  soundTrackRating: 0.15,
  charDevelopmentRating: 0.1
} as const;

const parseAccessToken = (body: unknown): string => {
  if (typeof body !== "object" || body === null) {
    throw new Error("Response body is not an object");
  }
  const record: Record<string, unknown> = body;
  const accessToken = record.accessToken;
  if (typeof accessToken !== "string" || accessToken.length === 0) {
    throw new Error("Response body did not include accessToken");
  }
  return accessToken;
};

const refreshCookieFromSetCookie = (
  setCookie: string | string[] | undefined
): string => {
  const headers = Array.isArray(setCookie)
    ? setCookie
    : setCookie
      ? [setCookie]
      : [];
  const prefix = `${REFRESH_TOKEN_COOKIE_NAME}=`;
  const entry = headers.find((line) => line.startsWith(prefix));
  if (!entry) {
    throw new Error("Refresh token cookie was not set");
  }
  const semicolon = entry.indexOf(";");
  return semicolon === -1 ? entry : entry.slice(0, semicolon);
};

const parseGenreId = (body: unknown): number => {
  if (typeof body !== "object" || body === null) {
    throw new Error("Genre response is not an object");
  }
  const record: Record<string, unknown> = body;
  const id = record.id;
  if (typeof id !== "number" || !Number.isInteger(id) || id < 1) {
    throw new Error("Genre response did not include a valid id");
  }
  return id;
};

const parseSettingValue = (body: unknown): Record<string, unknown> => {
  if (typeof body !== "object" || body === null) {
    throw new Error("Setting response is not an object");
  }
  const record: Record<string, unknown> = body;
  const value = record.value;
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error("Setting response did not include an object value");
  }
  return value;
};

describe("Auth, settings, and genres (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    await resetDatabase();
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
    await disconnectTestPrisma();
  });

  describe("auth", () => {
    it("rejects invalid pins with 401", async () => {
      await request(app.getHttpServer())
        .post("/api/auth/login")
        .send({ pin1: "000000", pin2: "000000" })
        .expect(401);
    });

    it("logs in, refreshes, logs out, and rejects unauthenticated /me", async () => {
      const loginResponse = await request(app.getHttpServer())
        .post("/api/auth/login")
        .send({ pin1: TEST_PIN_1, pin2: TEST_PIN_2 })
        .expect(200);

      const accessToken = parseAccessToken(loginResponse.body);
      const refreshCookie = refreshCookieFromSetCookie(
        loginResponse.headers["set-cookie"]
      );
      expect(refreshCookie.startsWith(`${REFRESH_TOKEN_COOKIE_NAME}=`)).toBe(
        true
      );

      const refreshResponse = await request(app.getHttpServer())
        .post("/api/auth/refresh")
        .set("Cookie", refreshCookie)
        .expect(200);

      const refreshedAccessToken = parseAccessToken(refreshResponse.body);

      await request(app.getHttpServer())
        .get("/api/auth/me")
        .set(authHeader(refreshedAccessToken))
        .expect(200);

      await request(app.getHttpServer()).post("/api/auth/logout").expect(200);

      await request(app.getHttpServer()).get("/api/auth/me").expect(401);
    });
  });

  describe("genres", () => {
    const genreName = "E2E Test Genre";

    beforeEach(async () => {
      await resetDatabase();
      clearSettingsCache(app);
    });

    it("creates, lists publicly, rejects duplicate names, deletes, and returns 404 by id", async () => {
      const token = await login(app);

      const createResponse = await request(app.getHttpServer())
        .post("/api/genres")
        .set(authHeader(token))
        .send({ name: genreName })
        .expect(201);

      const genreId = parseGenreId(createResponse.body);

      const listResponse = await request(app.getHttpServer())
        .get("/api/genres")
        .query({ query: genreName, limit: 50 })
        .expect(200);

      const listBody: unknown = listResponse.body;
      if (typeof listBody !== "object" || listBody === null) {
        throw new Error("Genre list response is not an object");
      }
      const data = (listBody as Record<string, unknown>).data;
      if (!Array.isArray(data)) {
        throw new Error("Genre list response did not include data array");
      }
      const names = data.map((row) => {
        if (typeof row !== "object" || row === null) {
          return "";
        }
        const name = (row as Record<string, unknown>).name;
        return typeof name === "string" ? name : "";
      });
      expect(names).toContain(genreName);

      await request(app.getHttpServer())
        .post("/api/genres")
        .set(authHeader(token))
        .send({ name: genreName })
        .expect(409);

      await request(app.getHttpServer())
        .delete(`/api/genres/${genreId}`)
        .set(authHeader(token))
        .expect(204);

      await request(app.getHttpServer())
        .get(`/api/genres/${genreId}`)
        .set(authHeader(token))
        .expect(404);
    });
  });

  describe("settings", () => {
    beforeEach(async () => {
      await resetDatabase();
      clearSettingsCache(app);
    });

    it("returns seeded anime personal score weights", async () => {
      const token = await login(app);

      const response = await request(app.getHttpServer())
        .get("/api/settings/review.personal_score_weights.anime")
        .set(authHeader(token))
        .expect(200);

      expect(parseSettingValue(response.body)).toEqual(ANIME_WEIGHT_SEED);
    });

    it("updates media.catalog_sync and rejects invalid intervalDays", async () => {
      const token = await login(app);

      const updatedValue = { enabled: true, intervalDays: 7 };

      await request(app.getHttpServer())
        .put(`/api/settings/${MEDIA_CATALOG_SYNC_SETTING_KEY}`)
        .set(authHeader(token))
        .send({ value: updatedValue })
        .expect(200);

      const getResponse = await request(app.getHttpServer())
        .get(`/api/settings/${MEDIA_CATALOG_SYNC_SETTING_KEY}`)
        .set(authHeader(token))
        .expect(200);

      expect(parseSettingValue(getResponse.body)).toEqual(updatedValue);

      await request(app.getHttpServer())
        .put(`/api/settings/${MEDIA_CATALOG_SYNC_SETTING_KEY}`)
        .set(authHeader(token))
        .send({ value: { enabled: true, intervalDays: 0 } })
        .expect(400);
    });
  });
});
