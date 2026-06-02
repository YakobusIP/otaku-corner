import type { StructuredLogError } from "@/common/logging/structured-log.types";
import type { StructuredLogger } from "@/common/logging/structured-logger.service";

import type Bull from "bull";

const errorFromUnknown = (error: unknown): StructuredLogError =>
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

export const attachQueueInfrastructureLogging = (
  logger: StructuredLogger,
  queue: Bull.Queue
): void => {
  const queue_name = queue.name;

  queue.on("error", (error: Error) => {
    logger.logQueue({
      level: "error",
      event: "queue.error",
      message: "Queue error",
      correlation_id: null,
      request_id: null,
      user_id: null,
      error: errorFromUnknown(error),
      meta: {
        queue_name,
        job_id: null,
        job_name: "",
        attempt: 0,
        max_attempts: 0,
        duration_ms: null
      }
    });
  });

  queue.on("stalled", (job) => {
    logger.logQueue({
      level: "warn",
      event: "queue.job.stalled",
      message: "Queue job stalled",
      correlation_id: null,
      request_id: null,
      user_id: null,
      error: null,
      meta: {
        queue_name,
        job_id: job.id !== undefined ? String(job.id) : null,
        job_name: job.name,
        attempt: job.attemptsMade + 1,
        max_attempts:
          typeof job.opts.attempts === "number" ? job.opts.attempts : 0,
        duration_ms: null
      }
    });
  });

  queue.on("drained", () => {
    logger.logQueue({
      level: "info",
      event: "queue.drained",
      message: "Queue drained",
      correlation_id: null,
      request_id: null,
      user_id: null,
      error: null,
      meta: {
        queue_name,
        job_id: null,
        job_name: "",
        attempt: 0,
        max_attempts: 0,
        duration_ms: null
      }
    });
  });

  queue.on("close", () => {
    logger.logQueue({
      level: "info",
      event: "queue.closed",
      message: "Queue closed",
      correlation_id: null,
      request_id: null,
      user_id: null,
      error: null,
      meta: {
        queue_name,
        job_id: null,
        job_name: "",
        attempt: 0,
        max_attempts: 0,
        duration_ms: null
      }
    });
  });
};

export const logQueueJobEnqueued = (
  logger: StructuredLogger,
  params: {
    queue_name: string;
    job_id: string;
    job_name: string;
    correlation_id: string;
    request_id: string | null;
    meta?: Record<string, unknown>;
  }
): void => {
  logger.logQueue({
    level: "info",
    event: "queue.job.enqueued",
    message: "Queue job enqueued",
    correlation_id: params.correlation_id,
    request_id: params.request_id,
    user_id: null,
    error: null,
    meta: {
      queue_name: params.queue_name,
      job_id: params.job_id,
      job_name: params.job_name,
      attempt: 0,
      max_attempts: 0,
      duration_ms: null,
      ...(params.meta ?? {})
    }
  });
};

export const logQueueJobEnqueueFailed = (
  logger: StructuredLogger,
  params: {
    queue_name: string;
    job_name: string;
    correlation_id?: string;
    request_id?: string | null;
    error: unknown;
    meta?: Record<string, unknown>;
  }
): void => {
  logger.logQueue({
    level: "warn",
    event: "queue.job.enqueue_failed",
    message: "Failed to enqueue queue job",
    correlation_id: params.correlation_id ?? null,
    request_id: params.request_id ?? null,
    user_id: null,
    error: errorFromUnknown(params.error),
    meta: {
      queue_name: params.queue_name,
      job_id: null,
      job_name: params.job_name,
      attempt: 0,
      max_attempts: 0,
      duration_ms: null,
      ...(params.meta ?? {})
    }
  });
};
