import { isRetryableCatalogSyncError } from "@/media-sync/lib/catalog-sync-error";

import {
  MediaSyncJobPublicationStatus,
  MediaSyncMediaType
} from "@prisma/client";

export const MEDIA_CATALOG_SYNC_PUBLICATION_MAX_ATTEMPTS = 5;
export const MEDIA_CATALOG_SYNC_PUBLICATION_RECONCILE_INTERVAL_MS = 30_000;
/** Grace period before a PUBLISHED row is eligible for stale-job recovery. */
export const MEDIA_CATALOG_SYNC_PUBLICATION_STALE_GRACE_MS = 60_000;

export type MediaCatalogSyncPublicationTarget = {
  syncRunId: string;
  mediaType: MediaSyncMediaType;
  mediaId: number;
};

export const buildMediaCatalogSyncJobId = (
  target: MediaCatalogSyncPublicationTarget
): string =>
  `media-catalog-sync:${target.syncRunId}:${target.mediaType}:${target.mediaId}`;

export type QueueJobLookupState =
  | "present"
  | "absent"
  | "terminal_failed"
  | "unknown";

export type QueueJobLookupSnapshot = {
  state: string;
  attemptsMade: number;
  maxAttempts: number;
  failedReason?: string | null;
};

export type QueueJobLookupResult = {
  state: QueueJobLookupState;
  failedReason: string | null;
};

export const DEFAULT_MEDIA_CATALOG_SYNC_JOB_MAX_ATTEMPTS = 5;

export const isTerminalBullJobFailure = (input: {
  state: string;
  attemptsMade: number;
  maxAttempts: number;
}): boolean =>
  input.state === "failed" && input.attemptsMade >= input.maxAttempts;

export const classifyQueueJobLookupResult = (
  job: QueueJobLookupSnapshot | null | undefined
): Extract<QueueJobLookupState, "present" | "absent" | "terminal_failed"> => {
  if (job == null) {
    return "absent";
  }

  if (isTerminalBullJobFailure(job)) {
    return "terminal_failed";
  }

  return "present";
};

export const buildQueueJobLookupResult = (
  job: QueueJobLookupSnapshot | null | undefined
): QueueJobLookupResult => {
  const state = classifyQueueJobLookupResult(job);
  if (state !== "terminal_failed" || job == null) {
    return { state, failedReason: null };
  }

  const failedReason =
    typeof job.failedReason === "string" && job.failedReason.length > 0
      ? job.failedReason
      : null;

  return { state, failedReason };
};

export const shouldSkipPublicationReconciliation = (input: {
  isShuttingDown: boolean;
  reconciliationInFlight: boolean;
}): boolean => input.isShuttingDown || input.reconciliationInFlight;

export const isBullJobAlreadyExistsError = (error: unknown): boolean =>
  error instanceof Error && error.message.includes("already exists");

export const isRetryablePublicationError = (error: unknown): boolean => {
  if (isBullJobAlreadyExistsError(error)) {
    return true;
  }
  if (isRetryableCatalogSyncError(error)) {
    return true;
  }
  // Enqueue acknowledgment loss often surfaces as generic transport errors.
  return error instanceof Error;
};

export const shouldAbandonPublication = (
  error: unknown,
  attemptCount: number,
  maxAttempts: number = MEDIA_CATALOG_SYNC_PUBLICATION_MAX_ATTEMPTS
): boolean =>
  !isRetryablePublicationError(error) || attemptCount >= maxAttempts;

export type PublicationAttemptResult =
  | { kind: "published" }
  | { kind: "pending"; attemptCount: number; lastError: string }
  | { kind: "abandon"; attemptCount: number; lastError: string };

export const resolvePublicationAttempt = (input: {
  error: unknown;
  attemptCount: number;
  jobLookup: QueueJobLookupState;
  maxAttempts?: number;
}): PublicationAttemptResult => {
  if (
    input.jobLookup === "present" ||
    isBullJobAlreadyExistsError(input.error)
  ) {
    return { kind: "published" };
  }

  const attemptCount = input.attemptCount + 1;
  const lastError =
    input.error instanceof Error
      ? input.error.message
      : "Failed to publish catalog sync job";

  if (input.jobLookup === "terminal_failed") {
    return { kind: "abandon", attemptCount, lastError };
  }

  if (input.jobLookup === "unknown") {
    return { kind: "pending", attemptCount, lastError };
  }

  if (
    shouldAbandonPublication(
      input.error,
      attemptCount,
      input.maxAttempts ?? MEDIA_CATALOG_SYNC_PUBLICATION_MAX_ATTEMPTS
    )
  ) {
    return { kind: "abandon", attemptCount, lastError };
  }

  return { kind: "pending", attemptCount, lastError };
};

export const canAbandonPublicationAfterLookup = (
  jobLookup: QueueJobLookupState
): jobLookup is "absent" | "terminal_failed" =>
  jobLookup === "absent" || jobLookup === "terminal_failed";

export const isPublishedPublicationStale = (
  publishedAt: Date | null,
  now: Date,
  graceMs: number = MEDIA_CATALOG_SYNC_PUBLICATION_STALE_GRACE_MS
): boolean => {
  if (publishedAt === null) {
    return false;
  }

  return now.getTime() - publishedAt.getTime() >= graceMs;
};

export const shouldResetStalePublishedPublication = (input: {
  hasSyncItem: boolean;
  jobLookup: QueueJobLookupState;
}): boolean => {
  if (input.hasSyncItem) {
    return false;
  }

  return input.jobLookup === "absent";
};

export const shouldRecoverStalePublishedTerminalFailure = (input: {
  hasSyncItem: boolean;
  jobLookup: QueueJobLookupState;
}): boolean => {
  if (input.hasSyncItem) {
    return false;
  }

  return input.jobLookup === "terminal_failed";
};

export const buildStalePublishedPublicationCasWhere = (input: {
  publicationId: string;
  staleThreshold: Date;
}): {
  id: string;
  status: MediaSyncJobPublicationStatus;
  publishedAt: { lt: Date };
} => ({
  id: input.publicationId,
  status: MediaSyncJobPublicationStatus.PUBLISHED,
  publishedAt: { lt: input.staleThreshold }
});

export const resolveStalePublishedTerminalFailureMessage = (
  failedReason: string | null
): string => failedReason ?? "Catalog sync job failed terminally";
