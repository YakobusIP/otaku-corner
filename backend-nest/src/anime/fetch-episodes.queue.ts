import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";

import { BullQueueService } from "@/common/bull/bull-queue.service";
import {
  logQueueJobEnqueueFailed,
  logQueueJobEnqueued
} from "@/common/bull/queue-infrastructure-logging";
import { loggedAxiosRequest } from "@/common/logging/http-client-logging";
import {
  type RequestLogContextStore,
  getRequestLogContext
} from "@/common/logging/request-log-context";
import { StructuredLogger } from "@/common/logging/structured-logger.service";

import { PrismaService } from "@/prisma/prisma.service";

import { Prisma } from "@prisma/client";
import type Bull from "bull";
import { v4 as uuidv4 } from "uuid";

type FetchEpisodesJobData = {
  id: number;
  correlation_id?: string;
  request_id?: string | null;
};

type JikanEpisode = {
  mal_id: number;
  url: string;
  title: string;
  title_japanese?: string | null;
  title_romanji?: string | null;
  aired: string;
  score: number;
  filler: boolean;
  recap: boolean;
  forum_url: string;
};

type JikanResponse = {
  pagination: {
    last_visible_page: number;
    has_next_page: boolean;
  };
  data: JikanEpisode[];
};

@Injectable()
export class FetchEpisodesQueueService
  implements OnModuleInit, OnModuleDestroy
{
  private queue!: Bull.Queue<FetchEpisodesJobData>;

  constructor(
    private readonly bullQueue: BullQueueService,
    private readonly prisma: PrismaService,
    private readonly logger: StructuredLogger
  ) {}

  onModuleInit(): void {
    const queue = this.bullQueue.createQueue<FetchEpisodesJobData>(
      "fetchEpisodesQueue",
      {
        limiter: {
          max: 1,
          duration: 1000
        },
        defaultJobOptions: {
          attempts: 5,
          backoff: {
            type: "exponential",
            delay: 1000
          }
        }
      }
    );

    this.queue = queue;
    void queue.process((job) => this.processJob(job));
  }

  async onModuleDestroy(): Promise<void> {
    await this.queue.close();
  }

  enqueueAfterCreate(
    animeId: number,
    type: string,
    requestLog?: RequestLogContextStore
  ): void {
    if (["Movie", "OVA"].includes(type)) {
      return;
    }

    const als = getRequestLogContext();
    const correlation_id =
      requestLog?.correlation_id ?? als?.correlation_id ?? uuidv4();
    const request_id = requestLog?.request_id ?? als?.request_id ?? null;

    void this.queue
      .add({
        id: animeId,
        correlation_id,
        request_id: request_id ?? null
      })
      .then((job) => {
        logQueueJobEnqueued(this.logger, {
          queue_name: "fetchEpisodesQueue",
          job_id: String(job.id),
          job_name: "fetch-episodes",
          correlation_id,
          request_id,
          meta: {
            anime_id: animeId,
            anime_type: type,
            provider: "jikan"
          }
        });
      })
      .catch((error: unknown) => {
        logQueueJobEnqueueFailed(this.logger, {
          queue_name: "fetchEpisodesQueue",
          job_name: "fetch-episodes",
          correlation_id,
          request_id,
          error,
          meta: {
            anime_id: animeId,
            anime_type: type,
            provider: "jikan"
          }
        });
      });
  }

  private async processJob(job: Bull.Job<FetchEpisodesJobData>): Promise<void> {
    const correlation_id =
      job.data.correlation_id ??
      getRequestLogContext()?.correlation_id ??
      uuidv4();
    const request_id = job.data.request_id ?? null;
    const started = performance.now();
    const maxAttempts =
      typeof job.opts.attempts === "number" ? job.opts.attempts : 5;

    const queueMetaBase = {
      queue_name: "fetchEpisodesQueue",
      job_id: String(job.id),
      job_name: "fetch-episodes",
      attempt: job.attemptsMade + 1,
      max_attempts: maxAttempts,
      duration_ms: null as number | null,
      anime_id: job.data.id,
      provider: "jikan" as const
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
      const response = await loggedAxiosRequest<JikanResponse>(
        this.logger,
        {
          provider: "jikan",
          method: "GET",
          endpoint: "jikan.anime.episodes",
          correlation_id,
          request_id,
          queue_name: queueMetaBase.queue_name,
          job_id: queueMetaBase.job_id,
          job_name: queueMetaBase.job_name
        },
        {
          method: "GET",
          url: `https://api.jikan.moe/v4/anime/${job.data.id}/episodes`
        }
      );

      const episodesData: Prisma.AnimeEpisodeCreateManyInput[] =
        response.data.data.map((episode) => ({
          aired: episode.aired
            ? new Date(episode.aired).toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
                year: "numeric"
              })
            : "N/A",
          number: episode.mal_id,
          title: episode.title,
          titleJapanese: episode.title_japanese ?? undefined,
          titleRomaji: episode.title_romanji ?? undefined,
          animeId: job.data.id
        }));

      await this.prisma.animeEpisode.createMany({
        data: episodesData,
        skipDuplicates: true
      });

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
          duration_ms,
          episodes_written: episodesData.length
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
