import { isUpstreamFieldPresent } from "@/media-sync/lib/catalog-field-policy";
import { type SyncConflict } from "@/media-sync/lib/catalog-sync-merge";

import { MediaSyncItemOutcome, type Prisma } from "@prisma/client";

type ConflictItemBaseline = Prisma.JsonValue | null | undefined;

export const hasTrustedConflictBaseline = (
  baselineCatalog: ConflictItemBaseline
): boolean => {
  if (
    !baselineCatalog ||
    typeof baselineCatalog !== "object" ||
    Array.isArray(baselineCatalog)
  ) {
    return false;
  }

  return Object.keys(baselineCatalog).length > 0;
};

export const isLegacyUntrustedConflictItem = (item: {
  outcome: MediaSyncItemOutcome;
  baselineCatalog: ConflictItemBaseline;
}): boolean =>
  item.outcome === MediaSyncItemOutcome.CONFLICT &&
  !hasTrustedConflictBaseline(item.baselineCatalog);

export const mergeOpenConflictFields = (
  existingConflicts: SyncConflict[],
  incomingConflicts: SyncConflict[]
): SyncConflict[] => {
  const byField = new Map<string, SyncConflict>();

  for (const conflict of existingConflicts) {
    byField.set(conflict.field, conflict);
  }
  for (const conflict of incomingConflicts) {
    byField.set(conflict.field, conflict);
  }

  return [...byField.values()];
};

/** Keeps original trusted conflict rows (especially base) for fields already open. */
export const mergeTrustedOpenConflictFields = (
  existingConflicts: SyncConflict[],
  incomingConflicts: SyncConflict[]
): SyncConflict[] => {
  const byField = new Map<string, SyncConflict>();

  for (const conflict of existingConflicts) {
    byField.set(conflict.field, conflict);
  }
  for (const conflict of incomingConflicts) {
    if (!byField.has(conflict.field)) {
      byField.set(conflict.field, conflict);
    }
  }

  return [...byField.values()];
};

export const parseConflictItemBaselineCatalog = (
  baselineCatalog: ConflictItemBaseline
): Record<string, unknown> => {
  if (
    !baselineCatalog ||
    typeof baselineCatalog !== "object" ||
    Array.isArray(baselineCatalog)
  ) {
    return {};
  }

  return baselineCatalog as Record<string, unknown>;
};

export const collectContestedConflictFields = (
  conflicts: readonly SyncConflict[]
): Set<string> => new Set(conflicts.map((conflict) => conflict.field));

export const refreshConflictSnapshots = (
  conflict: SyncConflict,
  localRecord: Record<string, unknown>,
  upstreamCatalog: Record<string, unknown>
): SyncConflict => {
  const local = Object.prototype.hasOwnProperty.call(
    localRecord,
    conflict.field
  )
    ? localRecord[conflict.field]
    : conflict.local;

  const upstream = isUpstreamFieldPresent(upstreamCatalog, conflict.field)
    ? upstreamCatalog[conflict.field]
    : conflict.upstream;

  return {
    ...conflict,
    local,
    upstream
  };
};

export const refreshOpenConflictSnapshots = (
  conflicts: SyncConflict[],
  localRecord: Record<string, unknown>,
  upstreamCatalog: Record<string, unknown>
): SyncConflict[] =>
  conflicts.map((conflict) =>
    refreshConflictSnapshots(conflict, localRecord, upstreamCatalog)
  );

const stableConflictDisplay = (conflicts: SyncConflict[]): string =>
  JSON.stringify(
    conflicts.map((conflict) => ({
      field: conflict.field,
      base: conflict.base,
      local: conflict.local,
      upstream: conflict.upstream,
      rule: conflict.rule
    }))
  );

const stablePendingUpstream = (
  pendingUpstream: Record<string, unknown>
): string => JSON.stringify(pendingUpstream);

export const openConflictDisplayChanged = (params: {
  beforeConflicts: SyncConflict[];
  afterConflicts: SyncConflict[];
  beforePendingUpstream: Record<string, unknown>;
  afterPendingUpstream: Record<string, unknown>;
  beforeMediaTitle: string | null;
  afterMediaTitle: string | null;
}): boolean =>
  stableConflictDisplay(params.beforeConflicts) !==
    stableConflictDisplay(params.afterConflicts) ||
  stablePendingUpstream(params.beforePendingUpstream) !==
    stablePendingUpstream(params.afterPendingUpstream) ||
  params.beforeMediaTitle !== params.afterMediaTitle;

export const omitCatalogFields = (
  data: Record<string, unknown>,
  fields: ReadonlySet<string>
): Record<string, unknown> => {
  const result: Record<string, unknown> = {};

  for (const [field, value] of Object.entries(data)) {
    if (!fields.has(field)) {
      result[field] = value;
    }
  }

  return result;
};
