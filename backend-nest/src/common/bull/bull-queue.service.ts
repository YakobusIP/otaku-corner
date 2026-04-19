import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import Bull from "bull";

@Injectable()
export class BullQueueService {
  constructor(private readonly config: ConfigService) {}

  getRedisConnection(): Bull.QueueOptions["redis"] | null {
    const host = this.config.get<string>("BULL_REDIS_IP");
    if (!host) {
      return null;
    }
    return {
      host,
      port: this.config.get<number>("BULL_REDIS_PORT", 6379),
      maxRetriesPerRequest: null
    };
  }

  isRedisConfigured(): boolean {
    return this.getRedisConnection() !== null;
  }

  createQueue<T = unknown>(
    queueName: string,
    options: Omit<Bull.QueueOptions, "redis"> = {}
  ): Bull.Queue<T> | null {
    const redis = this.getRedisConnection();
    if (!redis) {
      return null;
    }
    return new Bull<T>(queueName, {
      ...options,
      redis
    });
  }
}
