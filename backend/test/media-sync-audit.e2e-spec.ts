import type { INestApplication } from "@nestjs/common";

import { MediaCatalogSyncService } from "@/media-sync/media-catalog-sync.service";

import {
  type Anime,
  MediaSyncItemOutcome,
  MediaSyncMediaType,
  MediaSyncRunStatus,
  MediaSyncRunType,
  type Prisma
} from "@prisma/client";
import request from "supertest";

import { authHeader, createTestApp, login } from "./create-test-app";
import { tenraiForwardGet } from "./e2e-fakes";
import {
  disconnectTestPrisma,
  getTestPrisma,
  resetDatabase
} from "./reset-database";

const ANIME_ID = 940_001;
const ANIME_SLUG = "e2e-media-sync-audit-940001";

const POSTER_IMAGES = {
  image_url: "https://example.com/e2e-sync-poster.jpg",
  large_image_url: "https://example.com/e2e-sync-poster-large.jpg",
  small_image_url: "https://example.com/e2e-sync-poster-small.jpg"
} as const;

const ANIME_BULK_ITEM = {
  id: ANIME_ID,
  slug: ANIME_SLUG,
  type: "Movie",
  status: "Finished Airing",
  rating: "PG-13 - Teens 13 or older",
  title: "E2E Catalog Sync Audit Anime",
  titleJapanese: "同期監査映画",
  titleSynonyms: "e2e sync",
  source: "Original",
  aired: "Jan 1, 2020",
  broadcast: "N/A",
  duration: "120 min",
  synopsis: "End-to-end catalog sync and audit coverage.",
  images: POSTER_IMAGES,
  malUrl: `https://myanimelist.net/anime/${ANIME_ID}/E2E-Sync`,
  genres: ["Action"],
  studios: ["E2E Studio"],
  themes: ["School"]
} as const;

type JsonImages = {
  image_url: string;
  large_image_url?: string;
  small_image_url?: string;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const readImagesJson = (value: Prisma.JsonValue): JsonImages => {
  if (!isRecord(value) || typeof value.image_url !== "string") {
    throw new Error("Anime images JSON did not include image_url");
  }
  return {
    image_url: value.image_url,
    large_image_url:
      typeof value.large_image_url === "string"
        ? value.large_image_url
        : value.image_url,
    small_image_url:
      typeof value.small_image_url === "string"
        ? value.small_image_url
        : value.image_url
  };
};

const buildTenraiAnimePayload = (
  anime: Anime,
  patch?: { synopsis?: string }
): Record<string, unknown> => {
  const images = readImagesJson(anime.images);
  const synonyms = anime.titleSynonyms
    .split(/\s+/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);

  return {
    mal_id: anime.id,
    type: anime.type,
    status: anime.status,
    rating: "pg13",
    title: anime.title,
    title_japanese: anime.titleJapanese,
    title_synonyms: synonyms.length > 0 ? synonyms : ["e2e", "sync"],
    source: anime.source,
    aired: { from: "2020-01-01T00:00:00.000Z", to: null },
    broadcast: { string: anime.broadcast },
    episodes: anime.episodesCount,
    duration: anime.duration,
    score: anime.score,
    images: {
      jpg: {
        image_url: images.image_url,
        large_image_url: images.large_image_url ?? images.image_url,
        small_image_url: images.small_image_url ?? images.image_url
      }
    },
    synopsis: patch?.synopsis ?? anime.synopsis,
    trailer: anime.trailer ? { embed_url: anime.trailer } : undefined,
    url: anime.malUrl
  };
};

const createSyncRunId = async (): Promise<string> => {
  const run = await getTestPrisma().mediaSyncRun.create({
    data: {
      type: MediaSyncRunType.MANUAL,
      status: MediaSyncRunStatus.RUNNING,
      startedAt: new Date()
    }
  });
  return run.id;
};

const loadAnime = async (): Promise<Anime> => {
  const anime = await getTestPrisma().anime.findFirst({
    where: { id: ANIME_ID, deletedAt: null }
  });
  if (!anime) {
    throw new Error(`Anime ${ANIME_ID} was not found after bulk create`);
  }
  return anime;
};

describe("Media catalog sync and audit (e2e)", () => {
  let app: INestApplication;
  let token: string;
  let syncService: MediaCatalogSyncService;

  beforeAll(async () => {
    await resetDatabase();
    app = await createTestApp();
    token = await login(app);
    syncService = app.get(MediaCatalogSyncService);
  });

  afterAll(async () => {
    await app.close();
    await disconnectTestPrisma();
  });

  const seedAnimeViaBulk = async (): Promise<void> => {
    await request(app.getHttpServer())
      .post("/api/animes/bulk")
      .set(authHeader(token))
      .send({ data: [ANIME_BULK_ITEM] })
      .expect(201);
  };

  const resetAnimeFixture = async (): Promise<Anime> => {
    await resetDatabase();
    token = await login(app);
    await seedAnimeViaBulk();
    return loadAnime();
  };

  it("syncMedia records UNCHANGED when Tenrai catalog matches local fields", async () => {
    const anime = await resetAnimeFixture();
    const syncRunId = await createSyncRunId();

    tenraiForwardGet.mockReset();
    tenraiForwardGet.mockResolvedValue(buildTenraiAnimePayload(anime));

    const result = await syncService.syncMedia({
      mediaType: MediaSyncMediaType.ANIME,
      mediaId: ANIME_ID,
      syncRunId
    });

    expect(result.outcome).toBe(MediaSyncItemOutcome.UNCHANGED);
    expect(result.conflicts).toHaveLength(0);

    const storedItem = await getTestPrisma().mediaSyncItem.findUnique({
      where: {
        syncRunId_mediaType_mediaId: {
          syncRunId,
          mediaType: MediaSyncMediaType.ANIME,
          mediaId: ANIME_ID
        }
      }
    });
    expect(storedItem?.outcome).toBe(MediaSyncItemOutcome.UNCHANGED);
  });

  it("syncMedia records CONFLICT, lists it openly, and keep-existing resolves it", async () => {
    const anime = await resetAnimeFixture();
    const syncRunId = await createSyncRunId();

    tenraiForwardGet.mockReset();
    tenraiForwardGet.mockResolvedValue(
      buildTenraiAnimePayload(anime, {
        synopsis: "Upstream synopsis that diverges from the local copy."
      })
    );

    const syncResult = await syncService.syncMedia({
      mediaType: MediaSyncMediaType.ANIME,
      mediaId: ANIME_ID,
      syncRunId
    });

    expect(syncResult.outcome).toBe(MediaSyncItemOutcome.CONFLICT);
    expect(syncResult.conflicts.length).toBeGreaterThan(0);

    const openList = await request(app.getHttpServer())
      .get("/api/media-sync-items/open-conflicts")
      .set(authHeader(token))
      .query({ page: 1, limit: 20 })
      .expect(200);

    const openBody: unknown = openList.body;
    if (!isRecord(openBody) || !Array.isArray(openBody.data)) {
      throw new Error("Open conflicts response did not include a data array");
    }

    const openForAnime: Record<string, unknown>[] = [];
    for (const row of openBody.data) {
      if (!isRecord(row)) {
        continue;
      }
      if (row.mediaId === ANIME_ID && row.mediaType === "ANIME") {
        openForAnime.push(row);
      }
    }
    expect(openForAnime.length).toBe(1);

    const conflictRow = openForAnime[0];
    const conflictId = conflictRow.id;
    const version = conflictRow.version;
    if (typeof conflictId !== "string" || typeof version !== "number") {
      throw new Error("Open conflict row missing id or version");
    }

    await request(app.getHttpServer())
      .post(`/api/media-sync-items/${conflictId}/keep-existing`)
      .set(authHeader(token))
      .send({ expectedVersion: version })
      .expect(201);

    const openAfter = await request(app.getHttpServer())
      .get("/api/media-sync-items/open-conflicts")
      .set(authHeader(token))
      .query({ page: 1, limit: 20 })
      .expect(200);

    const afterBody: unknown = openAfter.body;
    if (!isRecord(afterBody) || !Array.isArray(afterBody.data)) {
      throw new Error("Open conflicts response after resolve was invalid");
    }

    const stillOpen = afterBody.data.some((row) => {
      if (!isRecord(row)) {
        return false;
      }
      return row.mediaId === ANIME_ID && row.outcome === "CONFLICT";
    });
    expect(stillOpen).toBe(false);

    const resolvedItem = await getTestPrisma().mediaSyncItem.findUnique({
      where: { id: conflictId }
    });
    expect(resolvedItem?.outcome).toBe(MediaSyncItemOutcome.RESOLVED_KEPT);
    expect(resolvedItem?.resolvedAt).not.toBeNull();
  });

  it("syncMedia records FAILED for invalid Tenrai payload and leaves the anime row", async () => {
    await resetAnimeFixture();
    const syncRunId = await createSyncRunId();

    tenraiForwardGet.mockReset();
    tenraiForwardGet.mockResolvedValue({});

    const result = await syncService.syncMedia({
      mediaType: MediaSyncMediaType.ANIME,
      mediaId: ANIME_ID,
      syncRunId
    });

    expect(result.outcome).toBe(MediaSyncItemOutcome.FAILED);
    expect(result.errorMessage).toContain("Invalid Tenrai catalog payload");

    await request(app.getHttpServer())
      .get(`/api/animes/${ANIME_ID}`)
      .expect(200);

    const failedItem = await getTestPrisma().mediaSyncItem.findUnique({
      where: {
        syncRunId_mediaType_mediaId: {
          syncRunId,
          mediaType: MediaSyncMediaType.ANIME,
          mediaId: ANIME_ID
        }
      }
    });
    expect(failedItem?.outcome).toBe(MediaSyncItemOutcome.FAILED);
  });

  it("records a create audit log when an anime is added", async () => {
    await resetAnimeFixture();

    const auditResponse = await request(app.getHttpServer())
      .get("/api/audit-logs")
      .set(authHeader(token))
      .query({
        entityType: "anime",
        entityId: String(ANIME_ID),
        limit: 25
      })
      .expect(200);

    const auditBody: unknown = auditResponse.body;
    if (!isRecord(auditBody) || !Array.isArray(auditBody.items)) {
      throw new Error("Audit log response did not include items");
    }

    const entityId = String(ANIME_ID);
    const matching = auditBody.items.filter((item) => {
      if (!isRecord(item)) {
        return false;
      }
      return item.entityType === "anime" && item.entityId === entityId;
    });

    expect(
      matching.some((item) => isRecord(item) && item.action === "CREATE")
    ).toBe(true);
  });
});
