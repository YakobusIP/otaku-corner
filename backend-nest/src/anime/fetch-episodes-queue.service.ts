import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit
} from "@nestjs/common";

import { BullQueueService } from "@/common/bull/bull-queue.service";

import { PrismaService } from "@/prisma/prisma.service";

import { Prisma, QueueStatus } from "@prisma/client";
import axios from "axios";
import type Bull from "bull";
import { v4 as uuidv4 } from "uuid";

type FetchEpisodesJobData = {
  id: number;
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
  private queue: Bull.Queue<FetchEpisodesJobData> | null = null;

  private readonly logger = new Logger(FetchEpisodesQueueService.name);

  constructor(
    private readonly bullQueue: BullQueueService,
    private readonly prisma: PrismaService
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

    if (!queue) {
      this.logger.warn(
        "Bull Redis not configured (BULL_REDIS_IP / BULL_REDIS_PORT); fetch episodes queue is disabled"
      );
      return;
    }

    this.queue = queue;
    void queue.process((job) => this.processJob(job));
  }

  async onModuleDestroy(): Promise<void> {
    if (this.queue) {
      await this.queue.close();
      this.queue = null;
    }
  }

  enqueueAfterCreate(animeId: number, type: string): void {
    if (["Movie", "OVA"].includes(type)) {
      return;
    }

    if (!this.queue) {
      return;
    }

    try {
      void this.queue.add({ id: animeId });
    } catch (error) {
      this.logger.warn(
        `Failed to enqueue episode fetch for anime ${animeId}: ${(error as Error).message}`
      );
    }
  }

  private async processJob(job: Bull.Job<FetchEpisodesJobData>): Promise<void> {
    const jobId = `fetchEpisodesQueue-${String(job.id)}-${uuidv4()}`;
    await this.logJobStart(jobId, job.data);

    try {
      const response = await axios.get<JikanResponse>(
        `https://api.jikan.moe/v4/anime/${job.data.id}/episodes`
      );

      if (response.status !== 200) {
        await this.updateJobStatus(
          jobId,
          QueueStatus.FAILED,
          undefined,
          "Non-200 from Jikan"
        );
        throw new Error("Jikan returned non-200");
      }

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
      await this.updateJobStatus(jobId, QueueStatus.COMPLETED, episodesData);
    } catch (error) {
      const message = (error as Error).message;
      await this.updateJobStatus(jobId, QueueStatus.FAILED, undefined, message);
      throw error;
    }
  }

  private async logJobStart(
    jobId: string,
    data: Prisma.InputJsonValue
  ): Promise<void> {
    await this.prisma.queueLog.create({
      data: {
        jobId,
        queueName: "fetchEpisodesQueue",
        status: QueueStatus.QUEUED,
        data
      }
    });
  }

  private async updateJobStatus(
    jobId: string,
    status: QueueStatus,
    result?: Prisma.InputJsonValue,
    error?: string
  ): Promise<void> {
    await this.prisma.queueLog.update({
      where: { jobId },
      data: {
        status,
        completedAt: new Date(),
        result,
        error
      }
    });
  }
}
