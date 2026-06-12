import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";

import { BullQueueService } from "@/common/bull/bull-queue.service";
import {
  externalMetadataQueueRedisOptions,
  jobErrorFromUnknown,
  logMetadataSyncNoConfidentMatch
} from "@/common/bull/external-metadata-queue";
import {
  logQueueJobEnqueueFailed,
  logQueueJobEnqueued
} from "@/common/bull/queue-infrastructure-logging";
import {
  type HttpClientLogContext,
  loggedAxiosRequest
} from "@/common/logging/http-client-logging";
import {
  type RequestLogContextStore,
  getRequestLogContext
} from "@/common/logging/request-log-context";
import { StructuredLogger } from "@/common/logging/structured-logger.service";

import { PrismaService } from "@/prisma/prisma.service";

import { Prisma } from "@prisma/client";
import type Bull from "bull";
import { stringSimilarity } from "string-similarity-js";
import { v4 as uuidv4 } from "uuid";

/**
 * AniList manga search resolution (see `pickAnilistMedia`):
 *
 * 1. **MAL id (`idMal`)** — `Manga.id` is the MyAnimeList manga id. If any search hit has
 *    `idMal` equal to that id, we use it immediately. This avoids wrong picks when AniList
 *    has multiple entries with the same title (e.g. main series vs one-shot).
 * 2. **Title / synonym similarity** — existing thresholds when no `idMal` match.
 * 3. **Format preference** — when several hits tie on title rules, we prefer **`MANGA`**
 *    over **`ONE_SHOT`** (then any non–one-shot over one-shot) so volume/chapter sync does
 *    not latch onto a same-titled one-shot. A one-shot added later as its own MAL row still
 *    wins via step 1.
 */

const ANILIST_GRAPHQL_URL = "https://graphql.anilist.co";
const SIMILARITY_THRESHOLD = 0.9;
const MANGA_SEARCH_PER_PAGE = 25;

const MANGA_SEARCH_QUERY = `
query ($search: String!, $page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    media(search: $search, type: MANGA) {
      id
      idMal
      format
      status
      volumes
      chapters
      title {
        romaji
        english
        native
      }
      synonyms
    }
  }
}
`;

type FetchMangaDataJobData = {
  id: number;
  title: string;
  titleJapanese: string;
  correlation_id?: string;
  request_id?: string | null;
};

type AnilistMediaTitle = {
  romaji: string | null;
  english: string | null;
  native: string | null;
};

type AnilistMedia = {
  id: number;
  idMal: number | null;
  format: string;
  status: string;
  volumes: number | null;
  chapters: number | null;
  title: AnilistMediaTitle;
  synonyms: string[] | null;
};

type AnilistMangaSearchData = {
  Page: {
    media: AnilistMedia[] | null;
  };
};

type AnilistGraphqlEnvelope<T> = {
  data?: T;
  errors?: { message: string; status?: number }[];
};

const preferMangaFormatAmongCandidates = (
  candidates: AnilistMedia[]
): AnilistMedia | null => {
  if (candidates.length === 0) {
    return null;
  }
  const asManga = candidates.find((media) => media.format === "MANGA");
  if (asManga !== undefined) {
    return asManga;
  }
  const notOneshot = candidates.find((media) => media.format !== "ONE_SHOT");
  if (notOneshot !== undefined) {
    return notOneshot;
  }
  return candidates[0] ?? null;
};

const pickAnilistMedia = (
  items: AnilistMedia[],
  malMangaId: number,
  title: string,
  titleJapanese: string
): AnilistMedia | null => {
  if (items.length === 0) {
    return null;
  }

  const byMal = items.find((media) => media.idMal === malMangaId);
  if (byMal !== undefined) {
    return byMal;
  }

  if (titleJapanese.length > 0) {
    const exactNative = items.filter((media) => {
      const native = media.title.native ?? "";
      return native.length > 0 && titleJapanese === native;
    });
    const fromExactNative = preferMangaFormatAmongCandidates(exactNative);
    if (fromExactNative !== null) {
      return fromExactNative;
    }

    const exactSynonym = items.filter((media) =>
      (media.synonyms ?? []).some(
        (synonym) => synonym.length > 0 && titleJapanese === synonym
      )
    );
    const fromExactSynonym = preferMangaFormatAmongCandidates(exactSynonym);
    if (fromExactSynonym !== null) {
      return fromExactSynonym;
    }

    const similarNative = items.filter((media) => {
      const native = media.title.native ?? "";
      return (
        native.length > 0 &&
        stringSimilarity(titleJapanese, native) > SIMILARITY_THRESHOLD
      );
    });
    const fromSimilarNative = preferMangaFormatAmongCandidates(similarNative);
    if (fromSimilarNative !== null) {
      return fromSimilarNative;
    }

    const similarSynonym = items.filter((media) =>
      (media.synonyms ?? []).some(
        (synonym) =>
          synonym.length > 0 &&
          stringSimilarity(titleJapanese, synonym) > SIMILARITY_THRESHOLD
      )
    );
    const fromSimilarSynonym = preferMangaFormatAmongCandidates(similarSynonym);
    if (fromSimilarSynonym !== null) {
      return fromSimilarSynonym;
    }

    return null;
  }

  const similarEnglish = items.filter((media) => {
    const english = media.title.english ?? "";
    return (
      english.length > 0 &&
      stringSimilarity(title, english) > SIMILARITY_THRESHOLD
    );
  });
  const fromEnglish = preferMangaFormatAmongCandidates(similarEnglish);
  if (fromEnglish !== null) {
    return fromEnglish;
  }

  const similarRomaji = items.filter((media) => {
    const romaji = media.title.romaji ?? "";
    return (
      romaji.length > 0 &&
      stringSimilarity(title, romaji) > SIMILARITY_THRESHOLD
    );
  });
  const fromRomaji = preferMangaFormatAmongCandidates(similarRomaji);
  if (fromRomaji !== null) {
    return fromRomaji;
  }

  return null;
};

const postAnilistGraphql = async <T>(
  logger: StructuredLogger,
  httpContext: HttpClientLogContext,
  query: string,
  variables: Record<string, unknown>
): Promise<T> => {
  const response = await loggedAxiosRequest<AnilistGraphqlEnvelope<T>>(
    logger,
    httpContext,
    {
      method: "POST",
      url: ANILIST_GRAPHQL_URL,
      data: { query, variables },
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      }
    }
  );

  if (response.data.errors?.length) {
    const rateLimited = response.data.errors.some(
      (entry) => entry.status === 429
    );
    if (rateLimited) {
      logger.logHttpClient({
        level: "warn",
        event: "http_client.request.rate_limited",
        message: "AniList GraphQL rate limited",
        correlation_id: httpContext.correlation_id,
        request_id: httpContext.request_id,
        meta: {
          provider: httpContext.provider,
          method: httpContext.method,
          endpoint: httpContext.endpoint,
          status_code: 429
        }
      });
      throw new Error("AniList GraphQL rate limited (429)");
    }
    throw new Error(
      response.data.errors.map((entry) => entry.message).join("; ") ||
        "AniList GraphQL error"
    );
  }

  if (response.data.data === undefined || response.data.data === null) {
    throw new Error("AniList response missing data");
  }

  return response.data.data as T;
};

const floorCount = (value: number | null): number | null => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return null;
  }
  const floored = Math.floor(value);
  return floored >= 0 ? floored : null;
};

const applyVolumesAndChapters = async (
  prisma: PrismaService,
  mangaId: number,
  volumes: number | null,
  chapters: number | null
): Promise<void> => {
  const data: Prisma.MangaUpdateInput = {};
  const volumesCount = floorCount(volumes);
  const chaptersCount = floorCount(chapters);

  if (volumesCount !== null) {
    data.volumesCount = volumesCount;
  }
  if (chaptersCount !== null) {
    data.chaptersCount = chaptersCount;
  }

  if (Object.keys(data).length === 0) {
    return;
  }

  await prisma.manga.update({
    where: { id: mangaId },
    data
  });
};

@Injectable()
export class FetchMangaDataQueueService
  implements OnModuleInit, OnModuleDestroy
{
  private dataQueue!: Bull.Queue<FetchMangaDataJobData>;

  constructor(
    private readonly bullQueue: BullQueueService,
    private readonly prisma: PrismaService,
    private readonly logger: StructuredLogger
  ) {}

  onModuleInit(): void {
    const dataQ = this.bullQueue.createQueue<FetchMangaDataJobData>(
      "fetchMangaDataQueue",
      externalMetadataQueueRedisOptions
    );

    this.dataQueue = dataQ;

    void dataQ.process((job) => this.processFetchMangaData(job));
  }

  async onModuleDestroy(): Promise<void> {
    await this.dataQueue.close();
  }

  private enqueueJob(
    mangaId: number,
    title: string,
    titleJapanese: string,
    requestLog?: RequestLogContextStore
  ): void {
    const als = getRequestLogContext();
    const correlation_id =
      requestLog?.correlation_id ?? als?.correlation_id ?? uuidv4();
    const request_id = requestLog?.request_id ?? als?.request_id ?? null;

    void this.dataQueue
      .add({
        id: mangaId,
        title,
        titleJapanese,
        correlation_id,
        request_id: request_id ?? null
      })
      .then((job) => {
        logQueueJobEnqueued(this.logger, {
          queue_name: "fetchMangaDataQueue",
          job_id: String(job.id),
          job_name: "fetch-manga-data",
          correlation_id,
          request_id,
          meta: {
            manga_id: mangaId,
            provider: "anilist"
          }
        });
      })
      .catch((error: unknown) => {
        logQueueJobEnqueueFailed(this.logger, {
          queue_name: "fetchMangaDataQueue",
          job_name: "fetch-manga-data",
          correlation_id,
          request_id,
          error,
          meta: {
            manga_id: mangaId,
            provider: "anilist"
          }
        });
      });
  }

  enqueueAfterCreate(
    mangaId: number,
    title: string,
    titleJapanese: string,
    status: string,
    requestLog?: RequestLogContextStore
  ): void {
    if (status === "Upcoming") {
      return;
    }
    this.enqueueJob(mangaId, title, titleJapanese, requestLog);
  }

  /** Enqueues AniList metadata fetch regardless of publishing status (admin resync). */
  enqueueMetadataSync(
    mangaId: number,
    title: string,
    titleJapanese: string,
    requestLog?: RequestLogContextStore
  ): void {
    this.enqueueJob(mangaId, title, titleJapanese, requestLog);
  }

  private async processFetchMangaData(
    job: Bull.Job<FetchMangaDataJobData>
  ): Promise<void> {
    const correlation_id =
      job.data.correlation_id ??
      getRequestLogContext()?.correlation_id ??
      uuidv4();
    const request_id = job.data.request_id ?? null;
    const started = performance.now();
    const maxAttempts =
      typeof job.opts.attempts === "number" ? job.opts.attempts : 5;

    const queueMetaBase = {
      queue_name: "fetchMangaDataQueue",
      job_id: String(job.id),
      job_name: "fetch-manga-data",
      attempt: job.attemptsMade + 1,
      max_attempts: maxAttempts,
      duration_ms: null as number | null,
      manga_id: job.data.id,
      provider: "anilist" as const
    };

    this.logger.logQueue({
      level: "info",
      event: "queue.job.started",
      message: "Queue job started",
      correlation_id,
      request_id,
      user_id: null,
      error: null,
      meta: { ...queueMetaBase }
    });

    try {
      const search =
        job.data.titleJapanese.length > 0
          ? job.data.titleJapanese
          : job.data.title;

      const data = await postAnilistGraphql<AnilistMangaSearchData>(
        this.logger,
        {
          provider: "anilist",
          method: "POST",
          endpoint: "anilist.graphql",
          correlation_id,
          request_id,
          queue_name: queueMetaBase.queue_name,
          job_id: queueMetaBase.job_id,
          job_name: queueMetaBase.job_name
        },
        MANGA_SEARCH_QUERY,
        {
          search,
          page: 1,
          perPage: MANGA_SEARCH_PER_PAGE
        }
      );

      const mediaList = data.Page?.media ?? [];
      const chosen = pickAnilistMedia(
        mediaList,
        job.data.id,
        job.data.title,
        job.data.titleJapanese
      );

      if (chosen === null) {
        logMetadataSyncNoConfidentMatch(this.logger, {
          correlation_id,
          request_id,
          queue_name: "fetchMangaDataQueue",
          job_id: String(job.id),
          job_name: "fetch-manga-data",
          provider: "anilist",
          manga_id: job.data.id,
          search_query: search,
          candidate_count: mediaList.length
        });
      } else {
        await applyVolumesAndChapters(
          this.prisma,
          job.data.id,
          chosen.volumes,
          chosen.chapters
        );
      }

      const duration_ms = Math.round(performance.now() - started);
      this.logger.logQueue({
        level: "info",
        event: "queue.job.completed",
        message: "Queue job completed",
        correlation_id,
        request_id,
        user_id: null,
        error: null,
        meta: {
          ...queueMetaBase,
          duration_ms
        }
      });
    } catch (error) {
      const duration_ms = Math.round(performance.now() - started);
      this.logger.logQueue({
        level: "error",
        event: "queue.job.failed",
        message: "Queue job failed",
        correlation_id,
        request_id,
        user_id: null,
        error: jobErrorFromUnknown(error),
        meta: { ...queueMetaBase, duration_ms }
      });
      throw error;
    }
  }
}
