import { MediaSyncJobPublicationStatus } from "@prisma/client";

import {
  buildMediaCatalogSyncJobId,
  buildQueueJobLookupResult,
  buildStalePublishedPublicationCasWhere,
  canAbandonPublicationAfterLookup,
  classifyQueueJobLookupResult,
  isPublishedPublicationStale,
  isTerminalBullJobFailure,
  resolvePublicationAttempt,
  resolveStalePublishedTerminalFailureMessage,
  shouldAbandonPublication,
  shouldRecoverStalePublishedTerminalFailure,
  shouldResetStalePublishedPublication,
  shouldSkipPublicationReconciliation
} from "./media-catalog-sync-publication";

describe("media-catalog-sync-publication", () => {
  it("builds deterministic Bull job ids per run/media target", () => {
    expect(
      buildMediaCatalogSyncJobId({
        syncRunId: "run-1",
        mediaType: "ANIME",
        mediaId: 42
      })
    ).toBe("media-catalog-sync:run-1:ANIME:42");
  });

  it("classifies queue job lookup results by presence and terminal failure", () => {
    expect(classifyQueueJobLookupResult(null)).toBe("absent");
    expect(
      classifyQueueJobLookupResult({
        state: "waiting",
        attemptsMade: 0,
        maxAttempts: 5
      })
    ).toBe("present");
    expect(
      classifyQueueJobLookupResult({
        state: "active",
        attemptsMade: 1,
        maxAttempts: 5
      })
    ).toBe("present");
    expect(
      classifyQueueJobLookupResult({
        state: "completed",
        attemptsMade: 1,
        maxAttempts: 5
      })
    ).toBe("present");
    expect(
      classifyQueueJobLookupResult({
        state: "failed",
        attemptsMade: 2,
        maxAttempts: 5
      })
    ).toBe("present");
    expect(
      classifyQueueJobLookupResult({
        state: "failed",
        attemptsMade: 5,
        maxAttempts: 5
      })
    ).toBe("terminal_failed");
  });

  it("detects terminal Bull failures only when attempts are exhausted", () => {
    expect(
      isTerminalBullJobFailure({
        state: "failed",
        attemptsMade: 4,
        maxAttempts: 5
      })
    ).toBe(false);
    expect(
      isTerminalBullJobFailure({
        state: "failed",
        attemptsMade: 5,
        maxAttempts: 5
      })
    ).toBe(true);
  });

  it("builds queue job lookup results with failed reasons for terminal jobs", () => {
    expect(buildQueueJobLookupResult(null)).toEqual({
      state: "absent",
      failedReason: null
    });
    expect(
      buildQueueJobLookupResult({
        state: "failed",
        attemptsMade: 5,
        maxAttempts: 5,
        failedReason: "database unavailable"
      })
    ).toEqual({
      state: "terminal_failed",
      failedReason: "database unavailable"
    });
  });

  it("treats ambiguous enqueue failures as published when the job is confirmed present", () => {
    expect(
      resolvePublicationAttempt({
        error: new Error("redis unavailable"),
        attemptCount: 0,
        jobLookup: "present"
      })
    ).toEqual({ kind: "published" });
  });

  it("keeps ambiguous enqueue failures pending instead of abandoning immediately", () => {
    const result = resolvePublicationAttempt({
      error: new Error("redis unavailable"),
      attemptCount: 0,
      jobLookup: "absent"
    });

    expect(result).toEqual({
      kind: "pending",
      attemptCount: 1,
      lastError: "redis unavailable"
    });
    expect(shouldAbandonPublication(new Error("redis unavailable"), 1)).toBe(
      false
    );
  });

  it("never abandons when queue lookup state is unknown", () => {
    expect(
      resolvePublicationAttempt({
        error: new Error("redis unavailable"),
        attemptCount: 4,
        jobLookup: "unknown",
        maxAttempts: 5
      })
    ).toEqual({
      kind: "pending",
      attemptCount: 5,
      lastError: "redis unavailable"
    });
    expect(canAbandonPublicationAfterLookup("unknown")).toBe(false);
    expect(canAbandonPublicationAfterLookup("absent")).toBe(true);
    expect(canAbandonPublicationAfterLookup("terminal_failed")).toBe(true);
  });

  it("abandons immediately when the queue job is terminally failed", () => {
    expect(
      resolvePublicationAttempt({
        error: new Error("redis unavailable"),
        attemptCount: 0,
        jobLookup: "terminal_failed",
        maxAttempts: 5
      })
    ).toEqual({
      kind: "abandon",
      attemptCount: 1,
      lastError: "redis unavailable"
    });
  });

  it("abandons only after publication attempts are exhausted with confirmed absence", () => {
    const error = new Error("redis unavailable");

    expect(
      resolvePublicationAttempt({
        error,
        attemptCount: 4,
        jobLookup: "absent",
        maxAttempts: 5
      })
    ).toEqual({
      kind: "abandon",
      attemptCount: 5,
      lastError: "redis unavailable"
    });
  });

  it("skips reconciliation while shutting down or when a run is already in flight", () => {
    expect(
      shouldSkipPublicationReconciliation({
        isShuttingDown: true,
        reconciliationInFlight: false
      })
    ).toBe(true);
    expect(
      shouldSkipPublicationReconciliation({
        isShuttingDown: false,
        reconciliationInFlight: true
      })
    ).toBe(true);
    expect(
      shouldSkipPublicationReconciliation({
        isShuttingDown: false,
        reconciliationInFlight: false
      })
    ).toBe(false);
  });

  it("treats published rows as stale only after the grace period elapses", () => {
    const now = new Date("2026-01-01T00:02:00.000Z");
    const recent = new Date("2026-01-01T00:01:30.000Z");
    const aged = new Date("2026-01-01T00:00:30.000Z");

    expect(isPublishedPublicationStale(recent, now, 60_000)).toBe(false);
    expect(isPublishedPublicationStale(aged, now, 60_000)).toBe(true);
    expect(isPublishedPublicationStale(null, now, 60_000)).toBe(false);
  });

  it("resets stale published rows only when no sync item exists and the job is confirmed absent", () => {
    expect(
      shouldResetStalePublishedPublication({
        hasSyncItem: true,
        jobLookup: "absent"
      })
    ).toBe(false);
    expect(
      shouldResetStalePublishedPublication({
        hasSyncItem: false,
        jobLookup: "present"
      })
    ).toBe(false);
    expect(
      shouldResetStalePublishedPublication({
        hasSyncItem: false,
        jobLookup: "unknown"
      })
    ).toBe(false);
    expect(
      shouldResetStalePublishedPublication({
        hasSyncItem: false,
        jobLookup: "terminal_failed"
      })
    ).toBe(false);
    expect(
      shouldResetStalePublishedPublication({
        hasSyncItem: false,
        jobLookup: "absent"
      })
    ).toBe(true);
  });

  it("recovers stale published terminal failures only when no sync item exists", () => {
    expect(
      shouldRecoverStalePublishedTerminalFailure({
        hasSyncItem: true,
        jobLookup: "terminal_failed"
      })
    ).toBe(false);
    expect(
      shouldRecoverStalePublishedTerminalFailure({
        hasSyncItem: false,
        jobLookup: "present"
      })
    ).toBe(false);
    expect(
      shouldRecoverStalePublishedTerminalFailure({
        hasSyncItem: false,
        jobLookup: "terminal_failed"
      })
    ).toBe(true);
  });

  it("builds stale published CAS predicates with the publication timestamp guard", () => {
    const staleThreshold = new Date("2026-01-01T00:00:00.000Z");

    expect(
      buildStalePublishedPublicationCasWhere({
        publicationId: "pub-1",
        staleThreshold
      })
    ).toEqual({
      id: "pub-1",
      status: MediaSyncJobPublicationStatus.PUBLISHED,
      publishedAt: { lt: staleThreshold }
    });
  });

  it("falls back to a default terminal failure message when Bull has no failed reason", () => {
    expect(resolveStalePublishedTerminalFailureMessage(null)).toBe(
      "Catalog sync job failed terminally"
    );
    expect(
      resolveStalePublishedTerminalFailureMessage("database unavailable")
    ).toBe("database unavailable");
  });
});
