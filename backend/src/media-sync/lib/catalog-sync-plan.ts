import { isUpstreamFieldPresent } from "@/media-sync/lib/catalog-field-policy";
import { getFieldBaseline } from "@/media-sync/lib/catalog-sync-fields";
import {
  type SyncConflict,
  catalogValuesEqual,
  hasFieldBaseline,
  mergeCatalogFieldThreeWay
} from "@/media-sync/lib/catalog-sync-merge";

import type { MediaSyncMediaType } from "@prisma/client";

export type CatalogMergePlan = {
  applyData: Record<string, unknown>;
  baselineUpdates: Record<string, unknown>;
  conflicts: SyncConflict[];
  conflictBaseline: Record<string, unknown>;
};

export const computeCatalogMergePlan = (params: {
  mediaType: MediaSyncMediaType;
  fields: readonly string[];
  localRecord: Record<string, unknown>;
  upstreamCatalog: Record<string, unknown>;
  storedBaseline: Record<string, unknown> | null;
}): CatalogMergePlan => {
  const applyData: Record<string, unknown> = {};
  const baselineUpdates: Record<string, unknown> = {};
  const conflicts: SyncConflict[] = [];
  const conflictBaseline: Record<string, unknown> = {};

  for (const field of params.fields) {
    if (!isUpstreamFieldPresent(params.upstreamCatalog, field)) {
      continue;
    }

    const localValue = params.localRecord[field];
    const upstreamValue = params.upstreamCatalog[field];
    const baseValue = getFieldBaseline(params.storedBaseline, field);
    const merged = mergeCatalogFieldThreeWay(
      field,
      baseValue,
      localValue,
      upstreamValue
    );

    if (merged.kind === "conflict") {
      conflicts.push(merged.conflict);
      if (hasFieldBaseline(merged.conflict.base)) {
        conflictBaseline[field] = merged.conflict.base;
      }
      continue;
    }

    if (merged.kind === "apply") {
      applyData[field] = merged.value;
      baselineUpdates[field] = merged.value;
      continue;
    }

    if (merged.kind === "noop") {
      if (
        hasFieldBaseline(baseValue) ||
        catalogValuesEqual(field, localValue, upstreamValue)
      ) {
        baselineUpdates[field] = upstreamValue;
      }
      continue;
    }
  }

  return {
    applyData,
    baselineUpdates,
    conflicts,
    conflictBaseline
  };
};
