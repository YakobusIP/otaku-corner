import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import Bull from "bull";

@Injectable()
export class BullQueueService {
  constructor(private readonly config: ConfigService) {}

  getRedisConnection(): Bull.QueueOptions["redis"] {
    return {
      host: this.config.getOrThrow<string>("BULL_REDIS_IP"),
      port: this.config.get<number>("BULL_REDIS_PORT", 6379),
      maxRetriesPerRequest: null
    };
  }

  createQueue<T = unknown>(
    queueName: string,
    options: Omit<Bull.QueueOptions, "redis"> = {}
  ): Bull.Queue<T> {
    return new Bull<T>(queueName, {
      ...options,
      redis: this.getRedisConnection()
    });
  }
}
