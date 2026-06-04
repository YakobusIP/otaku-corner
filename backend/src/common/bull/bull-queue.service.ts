import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { attachQueueInfrastructureLogging } from "@/common/bull/queue-infrastructure-logging";
import { StructuredLogger } from "@/common/logging/structured-logger.service";

import Bull from "bull";

@Injectable()
export class BullQueueService {
  constructor(
    private readonly config: ConfigService,
    private readonly logger: StructuredLogger
  ) {}

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
    const queue = new Bull<T>(queueName, {
      ...options,
      redis: this.getRedisConnection()
    });

    attachQueueInfrastructureLogging(this.logger, queue);

    queue.client.on("error", (error: Error) => {
      this.logger.logQueue({
        level: "error",
        event: "queue.redis.error",
        message: "Queue Redis client error",
        correlation_id: null,
        request_id: null,
        user_id: null,
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack ?? ""
        },
        meta: {
          queue_name: queueName,
          job_id: null,
          job_name: "",
          attempt: 0,
          max_attempts: 0,
          duration_ms: null
        }
      });
    });

    return queue;
  }
}
