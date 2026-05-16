import type { StructuredLogError } from "@/common/logging/structured-log.types";
import type { StructuredLogger } from "@/common/logging/structured-logger.service";

export const EXTERNAL_METADATA_RATE_LIMIT_MS = 30_000;

export const externalMetadataQueueRedisOptions = {
  limiter: { max: 1, duration: EXTERNAL_METADATA_RATE_LIMIT_MS },
  defaultJobOptions: {
    attempts: 5,
    backoff: { type: "exponential" as const, delay: 1000 }
  }
};

export const jobErrorFromUnknown = (error: unknown): StructuredLogError =>
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

export const logMetadataSyncNoConfidentMatch = (
  logger: StructuredLogger,
  params: {
    correlation_id: string;
    request_id: string | null;
    queue_name: string;
    job_id: string;
    job_name: string;
    provider: "anilist" | "ranobedb";
    manga_id?: number;
    light_novel_id?: number;
    search_query: string;
    candidate_count: number;
  }
): void => {
  logger.logApplication({
    level: "info",
    event: "queue.metadata_sync.no_confident_match",
    message: "No confident provider match; skipping metadata update",
    error: null,
    meta: {
      queue_name: params.queue_name,
      job_id: params.job_id,
      job_name: params.job_name,
      provider: params.provider,
      correlation_id: params.correlation_id,
      request_id: params.request_id,
      ...(params.manga_id !== undefined ? { manga_id: params.manga_id } : {}),
      ...(params.light_novel_id !== undefined
        ? { light_novel_id: params.light_novel_id }
        : {}),
      search_query: params.search_query,
      candidate_count: params.candidate_count
    }
  });
};
