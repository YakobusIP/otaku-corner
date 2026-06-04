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

import type Bull from "bull";
import { stringSimilarity } from "string-similarity-js";
import { v4 as uuidv4 } from "uuid";

const RANOBEDB_API_BASE = "https://ranobedb.org/api/v0";
const SIMILARITY_THRESHOLD = 0.9;
const SERIES_SEARCH_LIMIT = 100;

type FetchLightNovelRanobeDbJobData = {
  id: number;
  title: string;
  titleJapanese: string;
  correlation_id?: string;
  request_id?: string | null;
};

type RanobeDbSeriesListRow = {
  id: number;
  title: string;
  title_orig: string | null;
  romaji: string | null;
  romaji_orig: string | null;
  c_num_books: number;
  volumes?: { count: string | number | bigint } | null;
};

type RanobeDbSeriesSearchResponse = {
  series: RanobeDbSeriesListRow[];
  count: string | number;
  currentPage: number;
  totalPages: number;
};

const pickRanobeDbSeries = (
  items: RanobeDbSeriesListRow[],
  title: string,
  titleJapanese: string
): RanobeDbSeriesListRow | null => {
  if (items.length === 0) {
    return null;
  }

  if (titleJapanese.length > 0) {
    for (const series of items) {
      const orig = series.title_orig ?? "";
      if (orig.length > 0 && titleJapanese === orig) {
        return series;
      }
    }

    for (const series of items) {
      const displayTitle = series.title ?? "";
      if (displayTitle.length > 0 && titleJapanese === displayTitle) {
        return series;
      }
    }

    for (const series of items) {
      const orig = series.title_orig ?? "";
      if (
        orig.length > 0 &&
        stringSimilarity(titleJapanese, orig) > SIMILARITY_THRESHOLD
      ) {
        return series;
      }
    }

    for (const series of items) {
      const romajiOrig = series.romaji_orig ?? "";
      if (
        romajiOrig.length > 0 &&
        stringSimilarity(titleJapanese, romajiOrig) > SIMILARITY_THRESHOLD
      ) {
        return series;
      }
    }

    for (const series of items) {
      const displayTitle = series.title ?? "";
      if (
        displayTitle.length > 0 &&
        stringSimilarity(titleJapanese, displayTitle) > SIMILARITY_THRESHOLD
      ) {
        return series;
      }
    }

    return null;
  }

  for (const series of items) {
    const displayTitle = series.title ?? "";
    if (
      displayTitle.length > 0 &&
      stringSimilarity(title, displayTitle) > SIMILARITY_THRESHOLD
    ) {
      return series;
    }
  }

  for (const series of items) {
    const romaji = series.romaji ?? "";
    if (
      romaji.length > 0 &&
      stringSimilarity(title, romaji) > SIMILARITY_THRESHOLD
    ) {
      return series;
    }
  }

  for (const series of items) {
    const romajiOrig = series.romaji_orig ?? "";
    if (
      romajiOrig.length > 0 &&
      stringSimilarity(title, romajiOrig) > SIMILARITY_THRESHOLD
    ) {
      return series;
    }
  }

  return null;
};

const getSeriesSearch = async (
  logger: StructuredLogger,
  httpContext: HttpClientLogContext,
  query: string
): Promise<RanobeDbSeriesListRow[]> => {
  const response = await loggedAxiosRequest<RanobeDbSeriesSearchResponse>(
    logger,
    httpContext,
    {
      method: "GET",
      url: `${RANOBEDB_API_BASE}/series`,
      params: {
        q: query,
        page: 1,
        limit: SERIES_SEARCH_LIMIT
      },
      headers: { Accept: "application/json" }
    }
  );

  return response.data.series ?? [];
};

const normalizeVolumeCount = (raw: unknown): number | null => {
  const n = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(n) || n < 0) {
    return null;
  }
  return Math.floor(n);
};

const resolveRanobeDbVolumeCount = (
  series: RanobeDbSeriesListRow
): number | null => {
  const fromBooks = normalizeVolumeCount(series.c_num_books);
  const rawVolumesCount =
    series.volumes?.count === undefined || series.volumes?.count === null
      ? null
      : typeof series.volumes.count === "bigint"
        ? Number(series.volumes.count)
        : series.volumes.count;
  const fromVolumes = normalizeVolumeCount(rawVolumesCount);

  if (fromBooks === null && fromVolumes === null) {
    return null;
  }
  return Math.max(fromBooks ?? 0, fromVolumes ?? 0);
};

@Injectable()
export class FetchLightNovelRanobeDbQueueService
  implements OnModuleInit, OnModuleDestroy
{
  private queue!: Bull.Queue<FetchLightNovelRanobeDbJobData>;

  constructor(
    private readonly bullQueue: BullQueueService,
    private readonly prisma: PrismaService,
    private readonly logger: StructuredLogger
  ) {}

  onModuleInit(): void {
    const q = this.bullQueue.createQueue<FetchLightNovelRanobeDbJobData>(
      "fetchLightNovelRanobeDbQueue",
      externalMetadataQueueRedisOptions
    );

    this.queue = q;

    void q.process((job) => this.processJob(job));
  }

  async onModuleDestroy(): Promise<void> {
    await this.queue.close();
  }

  enqueueAfterCreate(
    lightNovelId: number,
    title: string,
    titleJapanese: string,
    requestLog?: RequestLogContextStore
  ): void {
    const als = getRequestLogContext();
    const correlation_id =
      requestLog?.correlation_id ?? als?.correlation_id ?? uuidv4();
    const request_id = requestLog?.request_id ?? als?.request_id ?? null;

    void this.queue
      .add({
        id: lightNovelId,
        title,
        titleJapanese,
        correlation_id,
        request_id: request_id ?? null
      })
      .then((job) => {
        logQueueJobEnqueued(this.logger, {
          queue_name: "fetchLightNovelRanobeDbQueue",
          job_id: String(job.id),
          job_name: "fetch-light-novel-ranobedb",
          correlation_id,
          request_id,
          meta: {
            light_novel_id: lightNovelId,
            provider: "ranobedb"
          }
        });
      })
      .catch((error: unknown) => {
        logQueueJobEnqueueFailed(this.logger, {
          queue_name: "fetchLightNovelRanobeDbQueue",
          job_name: "fetch-light-novel-ranobedb",
          correlation_id,
          request_id,
          error,
          meta: {
            light_novel_id: lightNovelId,
            provider: "ranobedb"
          }
        });
      });
  }

  private async processJob(
    job: Bull.Job<FetchLightNovelRanobeDbJobData>
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
      queue_name: "fetchLightNovelRanobeDbQueue",
      job_id: String(job.id),
      job_name: "fetch-light-novel-ranobedb",
      attempt: job.attemptsMade + 1,
      max_attempts: maxAttempts,
      duration_ms: null as number | null,
      light_novel_id: job.data.id,
      provider: "ranobedb" as const
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

      const seriesList = await getSeriesSearch(
        this.logger,
        {
          provider: "ranobedb",
          method: "GET",
          endpoint: "ranobedb.series.search",
          correlation_id,
          request_id,
          queue_name: queueMetaBase.queue_name,
          job_id: queueMetaBase.job_id,
          job_name: queueMetaBase.job_name
        },
        search
      );
      const chosen = pickRanobeDbSeries(
        seriesList,
        job.data.title,
        job.data.titleJapanese
      );

      const newCount =
        chosen !== null ? resolveRanobeDbVolumeCount(chosen) : null;

      if (chosen === null) {
        logMetadataSyncNoConfidentMatch(this.logger, {
          correlation_id,
          request_id,
          queue_name: "fetchLightNovelRanobeDbQueue",
          job_id: String(job.id),
          job_name: "fetch-light-novel-ranobedb",
          provider: "ranobedb",
          light_novel_id: job.data.id,
          search_query: search,
          candidate_count: seriesList.length
        });
      } else if (newCount === null) {
        this.logger.logQueue({
          level: "warn",
          event: "queue.metadata_sync.invalid_provider_count",
          message:
            "RanobeDB series matched but volume counts were invalid; skipping update",
          correlation_id,
          request_id,
          user_id: null,
          error: null,
          meta: {
            queue_name: "fetchLightNovelRanobeDbQueue",
            job_id: String(job.id),
            job_name: queueMetaBase.job_name,
            attempt: queueMetaBase.attempt,
            max_attempts: queueMetaBase.max_attempts,
            duration_ms: null,
            provider: "ranobedb",
            light_novel_id: job.data.id,
            ranobedb_series_id: chosen.id,
            c_num_books: chosen.c_num_books,
            volumes_count: chosen.volumes?.count ?? null
          }
        });
      } else {
        await this.prisma.$transaction(async (tx) => {
          await tx.lightNovel.update({
            where: { id: job.data.id },
            data: { volumesCount: newCount }
          });

          await tx.lightNovelVolumes.deleteMany({
            // Rows with consumedAt set and volumeNumber > newCount are kept;
            // volumesCount may exceed max read slot until manual cleanup.
            where: {
              lightNovelId: job.data.id,
              volumeNumber: { gt: newCount },
              consumedAt: null
            }
          });

          if (newCount > 0) {
            const existingRows = await tx.lightNovelVolumes.findMany({
              where: { lightNovelId: job.data.id },
              select: { volumeNumber: true }
            });
            const presentVolumeNumbers = new Set(
              existingRows.map((row) => row.volumeNumber)
            );
            const missingRows: {
              lightNovelId: number;
              volumeNumber: number;
              consumedAt: null;
            }[] = [];
            for (
              let volumeNumber = 1;
              volumeNumber <= newCount;
              volumeNumber++
            ) {
              if (!presentVolumeNumbers.has(volumeNumber)) {
                missingRows.push({
                  lightNovelId: job.data.id,
                  volumeNumber,
                  consumedAt: null
                });
              }
            }
            if (missingRows.length > 0) {
              await tx.lightNovelVolumes.createMany({
                data: missingRows,
                skipDuplicates: true
              });
            }
          }
        });
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
