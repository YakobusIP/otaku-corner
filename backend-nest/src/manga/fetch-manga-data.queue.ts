import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";

import { BullQueueService } from "@/common/bull/bull-queue.service";
import {
  type RequestLogContextStore,
  getRequestLogContext
} from "@/common/logging/request-log-context";
import { StructuredLogger } from "@/common/logging/structured-logger.service";

import { PrismaService } from "@/prisma/prisma.service";

import axios from "axios";
import type Bull from "bull";
import { stringSimilarity } from "string-similarity-js";
import { v4 as uuidv4 } from "uuid";

const BASE_MANGADEX_URL = "https://api.mangadex.org";
const SIMILARITY_THRESHOLD = 0.9;

type FetchMangaDataJobData = {
  id: number;
  title: string;
  titleJapanese: string;
  correlation_id?: string;
  request_id?: string | null;
};

type FetchMangaStatisticsJobData = {
  id: number;
  mangadex_id: string;
  correlation_id?: string;
  request_id?: string | null;
};

type AltTitle = Record<string, string>;

type MangaDexData = {
  id: string;
  attributes: {
    title: Record<string, string>;
    altTitles: AltTitle[];
    lastVolume: string;
    lastChapter: string;
    status: string;
  };
};

type MangaDexResponse = {
  result: string;
  data: MangaDexData[];
};

type MangaDexStatisticsResponse = {
  result: string;
  volumes: {
    [volumeKey: string]: {
      volume: string;
      count: number;
      chapters: {
        [chapterKey: string]: {
          chapter: string;
          id: string;
        };
      };
    };
  };
};

@Injectable()
export class FetchMangaDataQueueService
  implements OnModuleInit, OnModuleDestroy
{
  private dataQueue: Bull.Queue<FetchMangaDataJobData> | null = null;
  private statisticsQueue: Bull.Queue<FetchMangaStatisticsJobData> | null =
    null;

  constructor(
    private readonly bullQueue: BullQueueService,
    private readonly prisma: PrismaService,
    private readonly logger: StructuredLogger
  ) {}

  onModuleInit(): void {
    const redisOpts = {
      limiter: { max: 1, duration: 2000 },
      defaultJobOptions: {
        attempts: 5,
        backoff: { type: "exponential" as const, delay: 1000 }
      }
    };

    const dataQ = this.bullQueue.createQueue<FetchMangaDataJobData>(
      "fetchMangaDataQueue",
      redisOpts
    );
    const statsQ = this.bullQueue.createQueue<FetchMangaStatisticsJobData>(
      "fetchMangaStatisticsQueue",
      redisOpts
    );

    if (!dataQ || !statsQ) {
      this.logger.logApplication({
        level: "warn",
        event: "queue.fetch_manga.disabled",
        message:
          "Bull Redis not configured (BULL_REDIS_IP / BULL_REDIS_PORT); MangaDex fetch queues are disabled",
        error: null,
        meta: {
          queue_names: ["fetchMangaDataQueue", "fetchMangaStatisticsQueue"],
          reason: "redis_not_configured"
        }
      });
      return;
    }

    this.dataQueue = dataQ;
    this.statisticsQueue = statsQ;

    void dataQ.process((job) => this.processFetchMangaData(job, statsQ));
    void statsQ.process((job) => this.processFetchMangaStatistics(job));
  }

  async onModuleDestroy(): Promise<void> {
    if (this.dataQueue) {
      await this.dataQueue.close();
      this.dataQueue = null;
    }
    if (this.statisticsQueue) {
      await this.statisticsQueue.close();
      this.statisticsQueue = null;
    }
  }

  enqueueAfterCreate(
    mangaId: number,
    title: string,
    titleJapanese: string,
    status: string,
    requestLog?: RequestLogContextStore
  ): void {
    if (status === "Upcoming" || !this.dataQueue) {
      return;
    }

    const als = getRequestLogContext();
    const correlation_id =
      requestLog?.correlation_id ?? als?.correlation_id ?? undefined;
    const request_id = requestLog?.request_id ?? als?.request_id ?? undefined;

    try {
      void this.dataQueue.add({
        id: mangaId,
        title,
        titleJapanese,
        correlation_id,
        request_id: request_id ?? null
      });
    } catch (error) {
      this.logger.logApplication({
        level: "warn",
        event: "queue.fetch_manga.enqueue_failed",
        message: "Failed to enqueue MangaDex fetch job",
        error:
          error instanceof Error
            ? {
                name: error.name,
                message: error.message,
                stack: error.stack ?? ""
              }
            : null,
        meta: {
          queue_name: "fetchMangaDataQueue",
          operation: "enqueue",
          manga_id: mangaId,
          ...(correlation_id !== undefined ? { correlation_id } : {}),
          ...(request_id !== undefined ? { request_id } : {})
        }
      });
    }
  }

  private async handleMangaCompleted(
    id: number,
    manga: MangaDexData
  ): Promise<boolean> {
    const { lastVolume, lastChapter, status } = manga.attributes;

    if (status === "completed") {
      const volumesCount = parseFloat(lastVolume);
      const chaptersCount = parseFloat(lastChapter);

      if (!isNaN(volumesCount) && !isNaN(chaptersCount)) {
        await this.prisma.manga.update({
          where: { id },
          data: {
            volumesCount: Math.floor(volumesCount),
            chaptersCount: Math.floor(chaptersCount)
          }
        });

        return true;
      }
    }

    return false;
  }

  private async processMangaData(
    id: number,
    manga: MangaDexData,
    statsQueue: Bull.Queue<FetchMangaStatisticsJobData>,
    correlation_id: string,
    request_id: string | null
  ): Promise<void> {
    if (!(await this.handleMangaCompleted(id, manga))) {
      await statsQueue.add({
        id,
        mangadex_id: manga.id,
        correlation_id,
        request_id
      });
    }
  }

  private async processFetchMangaData(
    job: Bull.Job<FetchMangaDataJobData>,
    statsQueue: Bull.Queue<FetchMangaStatisticsJobData>
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
      manga_id: job.data.id
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
      const query =
        job.data.titleJapanese.length > 0
          ? job.data.titleJapanese
          : job.data.title;

      const response = await axios.get<MangaDexResponse>(
        `${BASE_MANGADEX_URL}/manga?title=${encodeURIComponent(query)}`
      );

      if (response.status === 200 && response.data.result === "ok") {
        if (response.data.data.length > 1) {
          let foundHighSimilarity = false;

          for (const manga of response.data.data) {
            const attributes = manga.attributes;
            let similarity = 0;

            if (job.data.titleJapanese.length > 0) {
              for (const alt of attributes.altTitles) {
                if ("ja" in alt) {
                  if (job.data.titleJapanese === alt["ja"]) {
                    foundHighSimilarity = true;
                    await this.processMangaData(
                      job.data.id,
                      manga,
                      statsQueue,
                      correlation_id,
                      request_id
                    );
                    break;
                  }

                  similarity = stringSimilarity(
                    job.data.titleJapanese,
                    alt["ja"]
                  );
                  if (similarity > SIMILARITY_THRESHOLD) {
                    foundHighSimilarity = true;
                    await this.processMangaData(
                      job.data.id,
                      manga,
                      statsQueue,
                      correlation_id,
                      request_id
                    );
                    break;
                  }
                }
              }
              if (foundHighSimilarity) break;
            } else if ("en" in attributes.title) {
              similarity = stringSimilarity(
                job.data.title,
                attributes.title["en"]
              );

              if (similarity > SIMILARITY_THRESHOLD) {
                foundHighSimilarity = true;
                await this.processMangaData(
                  job.data.id,
                  manga,
                  statsQueue,
                  correlation_id,
                  request_id
                );
                break;
              }
            }
          }

          if (!foundHighSimilarity && response.data.data.length > 0) {
            const manga = response.data.data[0];
            await this.processMangaData(
              job.data.id,
              manga,
              statsQueue,
              correlation_id,
              request_id
            );
          }
        } else if (response.data.data.length === 1) {
          const manga = response.data.data[0];
          await this.processMangaData(
            job.data.id,
            manga,
            statsQueue,
            correlation_id,
            request_id
          );
        }
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
      const err =
        error instanceof Error
          ? {
              name: error.name,
              message: error.message,
              stack: error.stack ?? ""
            }
          : {
              name: "Error",
              message: String(error),
              stack: ""
            };
      this.logger.logQueue({
        level: "error",
        event: "queue.job.failed",
        message: "Queue job failed",
        correlation_id,
        request_id,
        user_id: null,
        error: err,
        meta: { ...queueMetaBase, duration_ms }
      });
      throw error;
    }
  }

  private async processFetchMangaStatistics(
    job: Bull.Job<FetchMangaStatisticsJobData>
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
      queue_name: "fetchMangaStatisticsQueue",
      job_id: String(job.id),
      job_name: "fetch-manga-statistics",
      attempt: job.attemptsMade + 1,
      max_attempts: maxAttempts,
      duration_ms: null as number | null,
      manga_id: job.data.id
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
      const response = await axios.get<MangaDexStatisticsResponse>(
        `${BASE_MANGADEX_URL}/manga/${job.data.mangadex_id}/aggregate`
      );

      if (response.status === 200 && response.data.result === "ok") {
        const volumes = response.data.volumes;

        const volumeNumbers = Object.keys(volumes)
          .filter((key) => key !== "none")
          .map((key) => parseInt(key, 10))
          .filter((num) => !isNaN(num));

        const maxVolumeNumber =
          volumeNumbers.length > 0 ? Math.max(...volumeNumbers) : 0;

        const volumesCount = maxVolumeNumber + 1;

        const lastVolume = volumes["none"];
        let chaptersCount = 0;

        if (lastVolume?.chapters) {
          const chapterNumbers = Object.keys(lastVolume.chapters)
            .map((key) => parseFloat(key))
            .filter((num) => !isNaN(num));

          chaptersCount =
            chapterNumbers.length > 0 ? Math.max(...chapterNumbers) : 0;

          chaptersCount = Math.floor(chaptersCount);
        }

        await this.prisma.manga.update({
          where: { id: job.data.id },
          data: { volumesCount, chaptersCount }
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
      const err =
        error instanceof Error
          ? {
              name: error.name,
              message: error.message,
              stack: error.stack ?? ""
            }
          : {
              name: "Error",
              message: String(error),
              stack: ""
            };
      this.logger.logQueue({
        level: "error",
        event: "queue.job.failed",
        message: "Queue job failed",
        correlation_id,
        request_id,
        user_id: null,
        error: err,
        meta: { ...queueMetaBase, duration_ms }
      });
      throw error;
    }
  }
}
