-- One terminal outcome row per media per sync run (Bull at-least-once idempotency).
WITH ranked AS (
  SELECT
    id,
    "syncRunId",
    outcome,
    ROW_NUMBER() OVER (
      PARTITION BY "syncRunId", "mediaType", "mediaId"
      ORDER BY "createdAt" ASC, id ASC
    ) AS row_rank
  FROM "MediaSyncItem"
),
duplicates AS (
  SELECT id, "syncRunId", outcome
  FROM ranked
  WHERE row_rank > 1
),
deleted AS (
  DELETE FROM "MediaSyncItem" AS item
  USING duplicates AS dup
  WHERE item.id = dup.id
  RETURNING item."syncRunId", item.outcome
),
run_adjustments AS (
  SELECT
    "syncRunId",
    COUNT(*)::integer AS duplicate_count,
    COUNT(*) FILTER (
      WHERE outcome IN ('UPDATED', 'RESOLVED_ACCEPTED')
    )::integer AS updated_dupes,
    COUNT(*) FILTER (
      WHERE outcome IN ('UNCHANGED', 'RESOLVED_KEPT', 'RESOLVED_DISMISSED')
    )::integer AS unchanged_dupes,
    COUNT(*) FILTER (WHERE outcome = 'CONFLICT')::integer AS conflict_dupes,
    COUNT(*) FILTER (WHERE outcome = 'FAILED')::integer AS failed_dupes
  FROM deleted
  GROUP BY "syncRunId"
)
UPDATE "MediaSyncRun" AS run
SET
  "touchedCount" = GREATEST(0, run."touchedCount" - adjustments.duplicate_count),
  "updatedCount" = GREATEST(0, run."updatedCount" - adjustments.updated_dupes),
  "unchangedCount" = GREATEST(0, run."unchangedCount" - adjustments.unchanged_dupes),
  "conflictedCount" = GREATEST(0, run."conflictedCount" - adjustments.conflict_dupes),
  "failedCount" = GREATEST(0, run."failedCount" - adjustments.failed_dupes)
FROM run_adjustments AS adjustments
WHERE run.id = adjustments."syncRunId";

DROP INDEX IF EXISTS "MediaSyncItem_syncRunId_mediaType_mediaId_idx";

CREATE UNIQUE INDEX "MediaSyncItem_syncRunId_mediaType_mediaId_key"
ON "MediaSyncItem" ("syncRunId", "mediaType", "mediaId");
