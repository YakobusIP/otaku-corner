-- Dismiss duplicate open conflicts, keeping the newest row per media.
WITH ranked_conflicts AS (
  SELECT
    id,
    "syncRunId",
    ROW_NUMBER() OVER (
      PARTITION BY "mediaType", "mediaId"
      ORDER BY "createdAt" DESC, id DESC
    ) AS row_rank
  FROM "MediaSyncItem"
  WHERE outcome = 'CONFLICT'
),
dismissed AS (
  UPDATE "MediaSyncItem" AS item
  SET
    outcome = 'RESOLVED_DISMISSED',
    conflicts = NULL,
    "pendingUpstream" = NULL,
    "resolvedAt" = CURRENT_TIMESTAMP,
    "errorMessage" = 'Superseded by a newer open conflict for this media',
    version = item.version + 1
  FROM ranked_conflicts AS ranked
  WHERE item.id = ranked.id
    AND ranked.row_rank > 1
  RETURNING item."syncRunId"
),
run_adjustments AS (
  SELECT "syncRunId", COUNT(*)::integer AS dismissed_count
  FROM dismissed
  GROUP BY "syncRunId"
)
UPDATE "MediaSyncRun" AS run
SET
  "conflictedCount" = GREATEST(0, run."conflictedCount" - adjustments.dismissed_count),
  -- Move only conflicts the run currently counts, so a pre-existing
  -- counter inconsistency cannot increase the run's total item count.
  "unchangedCount" = run."unchangedCount" + LEAST(
    run."conflictedCount",
    adjustments.dismissed_count
  )
FROM run_adjustments AS adjustments
WHERE run.id = adjustments."syncRunId";

CREATE UNIQUE INDEX "MediaSyncItem_one_open_conflict_per_media_key"
ON "MediaSyncItem" ("mediaType", "mediaId")
WHERE outcome = 'CONFLICT';
