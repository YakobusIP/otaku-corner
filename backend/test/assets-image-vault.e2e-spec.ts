import type { INestApplication } from "@nestjs/common";

import { AssetInitReviewMediaType } from "@/assets/dto/review-asset-target.dto";

import { AssetStatus } from "@prisma/client";
import request from "supertest";

import { authHeader, createTestApp, login } from "./create-test-app";
import { fakeR2, rememberUploadedObject } from "./e2e-fakes";
import {
  disconnectTestPrisma,
  getTestPrisma,
  resetDatabase
} from "./reset-database";

const E2E_ANIME_MAL_ID = 930_001;
const REVIEW_IMAGE_BYTES = 1024;
const VAULT_IMAGE_BYTES = 2048;
const REVIEW_MIME = "image/png";
const VAULT_ENTRY_NOTES = "e2e image vault entry marker";

const ANIME_BULK_ITEM = {
  id: E2E_ANIME_MAL_ID,
  slug: "e2e-assets-anime",
  type: "Movie",
  status: "Finished Airing",
  rating: "G - All Ages",
  title: "E2E Assets Anime",
  titleJapanese: "E2Eアニメ",
  titleSynonyms: "",
  source: "Original",
  aired: "Jan 1, 2024 to Jan 1, 2024",
  broadcast: "",
  duration: "90 min",
  images: { image_url: "https://cdn.myanimelist.net/e2e/poster.jpg" },
  synopsis: "Minimal anime fixture for asset upload e2e.",
  malUrl: `https://myanimelist.net/anime/${E2E_ANIME_MAL_ID}`,
  genres: ["Action"],
  studios: ["E2E Studio"],
  themes: ["School"]
} as const;

const recordFromBody = (
  body: unknown,
  label: string
): Record<string, unknown> => {
  if (typeof body !== "object" || body === null) {
    throw new Error(`${label} is not an object`);
  }
  return body;
};

const parseUuidField = (body: unknown, field: string): string => {
  const record = recordFromBody(body, `Response for ${field}`);
  const value = record[field];
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Response did not include string ${field}`);
  }
  return value;
};

const parseCompleteAsset = (
  body: unknown
): { assetId: string; status: AssetStatus; url: string } => {
  const record = recordFromBody(body, "Complete asset response");
  const assetId = parseUuidField(record, "assetId");
  const status = record.status;
  if (status !== AssetStatus.READY && status !== AssetStatus.PENDING) {
    throw new Error("Unexpected asset status in complete response");
  }
  const url = record.url;
  if (typeof url !== "string" || url.length === 0) {
    throw new Error("Complete response did not include url");
  }
  return { assetId, status, url };
};

const storageKeyForAsset = async (assetId: string): Promise<string> => {
  const row = await getTestPrisma().asset.findUnique({
    where: { id: assetId },
    select: { storageKey: true, mimeType: true }
  });
  if (!row) {
    throw new Error(`Asset row not found for ${assetId}`);
  }
  return row.storageKey;
};

const mimeTypeForAsset = async (assetId: string): Promise<string> => {
  const row = await getTestPrisma().asset.findUnique({
    where: { id: assetId },
    select: { mimeType: true }
  });
  if (!row) {
    throw new Error(`Asset row not found for ${assetId}`);
  }
  return row.mimeType;
};

const ensureAnimeWithReview = async (
  app: INestApplication,
  token: string
): Promise<number> => {
  const existing = await getTestPrisma().animeReview.findUnique({
    where: { animeId: E2E_ANIME_MAL_ID },
    select: { id: true }
  });
  if (existing) {
    return existing.id;
  }

  await request(app.getHttpServer())
    .post("/api/animes/bulk")
    .set(authHeader(token))
    .send({ data: [ANIME_BULK_ITEM] })
    .expect(201);

  const review = await getTestPrisma().animeReview.findUnique({
    where: { animeId: E2E_ANIME_MAL_ID },
    select: { id: true }
  });
  if (!review) {
    throw new Error("Anime review was not created with bulk anime");
  }
  return review.id;
};

const initAndCompleteAsset = async (params: {
  app: INestApplication;
  token: string;
  initBody: Record<string, unknown>;
  expectedFileSize: number;
}): Promise<{ assetId: string; status: AssetStatus; url: string }> => {
  const initResponse = await request(params.app.getHttpServer())
    .post("/api/assets/init")
    .set(authHeader(params.token))
    .send(params.initBody)
    .expect(201);

  const assetId = parseUuidField(initResponse.body, "assetId");
  const storageKey = await storageKeyForAsset(assetId);
  const mimeType = await mimeTypeForAsset(assetId);
  rememberUploadedObject(storageKey, mimeType, params.expectedFileSize);

  const completeResponse = await request(params.app.getHttpServer())
    .post(`/api/assets/${assetId}/complete`)
    .set(authHeader(params.token))
    .expect(200);

  return parseCompleteAsset(completeResponse.body);
};

describe("Assets and image vault (e2e)", () => {
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    await resetDatabase();
    app = await createTestApp();
    accessToken = await login(app);
  });

  afterAll(async () => {
    await app.close();
    await disconnectTestPrisma();
  });

  beforeEach(() => {
    fakeR2.reset();
  });

  it("inits a review image, completes to READY, deletes, then complete returns 404", async () => {
    const animeReviewId = await ensureAnimeWithReview(app, accessToken);

    const completed = await initAndCompleteAsset({
      app,
      token: accessToken,
      expectedFileSize: REVIEW_IMAGE_BYTES,
      initBody: {
        target: {
          kind: "REVIEW",
          mediaType: AssetInitReviewMediaType.ANIME,
          id: animeReviewId
        },
        mimeType: REVIEW_MIME,
        expectedFileSize: REVIEW_IMAGE_BYTES,
        storageDirectory: "review-images"
      }
    });

    expect(completed.status).toBe(AssetStatus.READY);
    expect(completed.url).toContain("e2e-r2-public.example.com");

    await request(app.getHttpServer())
      .delete(`/api/assets/${completed.assetId}`)
      .set(authHeader(accessToken))
      .expect(200);

    await request(app.getHttpServer())
      .post(`/api/assets/${completed.assetId}/complete`)
      .set(authHeader(accessToken))
      .expect(404);
  });

  it("creates vault model and category, entry via completed asset, search, delete entry", async () => {
    const modelResponse = await request(app.getHttpServer())
      .post("/api/image-vault/models")
      .set(authHeader(accessToken))
      .send({
        name: "E2E Vault Model",
        provider: "E2E Provider",
        isActive: true
      })
      .expect(201);

    const modelId = parseUuidField(modelResponse.body, "id");

    const categoryResponse = await request(app.getHttpServer())
      .post("/api/image-vault/categories")
      .set(authHeader(accessToken))
      .send({
        name: "E2E Vault Category",
        slug: "e2e-vault-category"
      })
      .expect(201);

    const categoryId = parseUuidField(categoryResponse.body, "id");

    const vaultAsset = await initAndCompleteAsset({
      app,
      token: accessToken,
      expectedFileSize: VAULT_IMAGE_BYTES,
      initBody: {
        target: { kind: "IMAGE_VAULT" },
        mimeType: REVIEW_MIME,
        expectedFileSize: VAULT_IMAGE_BYTES
      }
    });

    expect(vaultAsset.status).toBe(AssetStatus.READY);

    const entryResponse = await request(app.getHttpServer())
      .post("/api/image-vault/images")
      .set(authHeader(accessToken))
      .send({
        assetId: vaultAsset.assetId,
        originType: "HUMAN",
        categoryIds: [categoryId],
        notes: VAULT_ENTRY_NOTES
      })
      .expect(201);

    const entryId = parseUuidField(entryResponse.body, "id");

    const searchResponse = await request(app.getHttpServer())
      .post("/api/image-vault/images/search")
      .set(authHeader(accessToken))
      .send({
        page: 1,
        limit: 20,
        groups: [
          {
            clauses: [
              {
                field: "notes",
                op: "contains",
                values: [VAULT_ENTRY_NOTES]
              }
            ]
          },
          {
            clauses: [
              {
                field: "category",
                op: "in",
                values: [categoryId]
              }
            ]
          }
        ]
      })
      .expect(200);

    const searchRecord = recordFromBody(searchResponse.body, "Image search");
    const data = searchRecord.data;
    if (!Array.isArray(data)) {
      throw new Error("Search response did not include data array");
    }
    const entryIds = data.map((row) => {
      if (typeof row !== "object" || row === null) {
        return "";
      }
      const id = (row as Record<string, unknown>).id;
      return typeof id === "string" ? id : "";
    });
    expect(entryIds).toContain(entryId);

    const modelsList = await request(app.getHttpServer())
      .get("/api/image-vault/models")
      .set(authHeader(accessToken))
      .expect(200);

    const modelsBody: unknown = modelsList.body;
    if (!Array.isArray(modelsBody)) {
      throw new Error("Models list response is not an array");
    }
    const modelIds = modelsBody.map((row) => {
      if (typeof row !== "object" || row === null) {
        return "";
      }
      const id = (row as Record<string, unknown>).id;
      return typeof id === "string" ? id : "";
    });
    expect(modelIds).toContain(modelId);

    await request(app.getHttpServer())
      .delete(`/api/image-vault/images/${entryId}`)
      .set(authHeader(accessToken))
      .expect(204);

    const afterDeleteSearch = await request(app.getHttpServer())
      .post("/api/image-vault/images/search")
      .set(authHeader(accessToken))
      .send({
        page: 1,
        limit: 20,
        groups: [
          {
            clauses: [
              {
                field: "notes",
                op: "eq",
                values: [VAULT_ENTRY_NOTES]
              }
            ]
          }
        ]
      })
      .expect(200);

    const afterRecord = recordFromBody(
      afterDeleteSearch.body,
      "Post-delete search"
    );
    const afterData = afterRecord.data;
    if (!Array.isArray(afterData)) {
      throw new Error("Post-delete search did not include data array");
    }
    expect(afterData).toHaveLength(0);
  });
});
