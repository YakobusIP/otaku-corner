import { getFieldBaseline } from "@/media-sync/lib/catalog-sync-fields";
import {
  type SyncConflict,
  catalogValuesEqual,
  hasFieldBaseline
} from "@/media-sync/lib/catalog-sync-merge";

import { MediaSyncItemOutcome } from "@prisma/client";

export type StoredFieldResolutionChoice = "keep_local" | "accept_upstream";
export type StoredFieldResolutions = Record<
  string,
  StoredFieldResolutionChoice
>;

/** Suppresses plan conflicts that match a prior resolution at the same upstream snapshot. */
export const reconcilePlanConflictsWithResolutions = (params: {
  planConflicts: SyncConflict[];
  priorResolutions: StoredFieldResolutions;
  storedBaseline: Record<string, unknown> | null;
}): SyncConflict[] =>
  params.planConflicts.filter((conflict) => {
    const priorChoice = params.priorResolutions[conflict.field];
    if (!priorChoice) {
      return true;
    }

    const resolvedUpstreamSnapshot = getFieldBaseline(
      params.storedBaseline,
      conflict.field
    );
    if (!hasFieldBaseline(resolvedUpstreamSnapshot)) {
      return true;
    }

    return !catalogValuesEqual(
      conflict.field,
      conflict.upstream,
      resolvedUpstreamSnapshot
    );
  });

export const buildPendingUpstreamFromConflicts = (
  conflicts: SyncConflict[]
): Record<string, unknown> => {
  const pending: Record<string, unknown> = {};
  for (const conflict of conflicts) {
    pending[conflict.field] = conflict.upstream;
  }
  return pending;
};

export const buildConflictBaselineSnapshot = (
  conflictBaseline: Record<string, unknown>,
  conflicts: SyncConflict[]
): Record<string, unknown> => {
  const openFields = new Set(conflicts.map((conflict) => conflict.field));
  const snapshot: Record<string, unknown> = {};

  for (const [field, value] of Object.entries(conflictBaseline)) {
    if (openFields.has(field)) {
      snapshot[field] = value;
    }
  }

  for (const conflict of conflicts) {
    if (
      hasFieldBaseline(conflict.base) &&
      !Object.prototype.hasOwnProperty.call(snapshot, conflict.field)
    ) {
      snapshot[conflict.field] = conflict.base;
    }
  }

  return snapshot;
};

export const outcomeForFieldResolutions = (
  resolutions: StoredFieldResolutions
): MediaSyncItemOutcome => {
  const acceptedAny = Object.values(resolutions).some(
    (choice) => choice === "accept_upstream"
  );
  return acceptedAny
    ? MediaSyncItemOutcome.RESOLVED_ACCEPTED
    : MediaSyncItemOutcome.RESOLVED_KEPT;
};
