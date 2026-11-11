import {
  ANIME_CATALOG_FIELDS,
  LIGHT_NOVEL_CATALOG_FIELDS,
  MANGA_CATALOG_FIELDS,
  catalogFieldsForMediaType
} from "@/media-sync/lib/catalog-sync-fields";

import type { MediaSyncMediaType } from "@prisma/client";

const NULLABLE_FIELDS: Record<MediaSyncMediaType, ReadonlySet<string>> = {
  ANIME: new Set(["season", "episodesCount", "score", "trailer"]),
  MANGA: new Set(["chaptersCount", "volumesCount", "score"]),
  LIGHT_NOVEL: new Set(["volumesCount", "score"])
};

export const isUpstreamFieldPresent = (
  upstreamCatalog: Record<string, unknown>,
  field: string
): boolean => Object.prototype.hasOwnProperty.call(upstreamCatalog, field);

export const isNullableCatalogField = (
  mediaType: MediaSyncMediaType,
  field: string
): boolean => NULLABLE_FIELDS[mediaType].has(field);

export const assertAcceptableApplyData = (
  mediaType: MediaSyncMediaType,
  applyData: Record<string, unknown>
): void => {
  for (const [field, value] of Object.entries(applyData)) {
    if (!catalogFieldsForMediaType(mediaType).includes(field)) {
      continue;
    }
    if (
      !isNullableCatalogField(mediaType, field) &&
      (value === null || value === undefined)
    ) {
      throw new Error(
        `Cannot apply empty upstream value to required catalog field "${field}"`
      );
    }
  }
};

export const isRequiredNullClearConflict = (
  mediaType: MediaSyncMediaType,
  conflict: {
    field: string;
    rule: string;
    upstream: unknown;
  }
): boolean =>
  conflict.rule === "null_clear" &&
  !isNullableCatalogField(mediaType, conflict.field) &&
  (conflict.upstream === null || conflict.upstream === undefined);

export const listBlockedAcceptUpstreamFields = (
  mediaType: MediaSyncMediaType,
  conflicts: readonly { field: string; rule: string; upstream: unknown }[]
): string[] =>
  conflicts
    .filter((conflict) => isRequiredNullClearConflict(mediaType, conflict))
    .map((conflict) => conflict.field);

export const buildBulkFieldChoiceMap = (
  mediaType: MediaSyncMediaType,
  conflicts: readonly { field: string; rule: string; upstream: unknown }[],
  choice: "accept_upstream" | "keep_local"
): Record<string, "accept_upstream" | "keep_local"> => {
  const blockedAcceptFields = new Set(
    listBlockedAcceptUpstreamFields(mediaType, conflicts)
  );
  const next: Record<string, "accept_upstream" | "keep_local"> = {};

  for (const conflict of conflicts) {
    if (
      choice === "accept_upstream" &&
      blockedAcceptFields.has(conflict.field)
    ) {
      continue;
    }
    next[conflict.field] = choice;
  }

  return next;
};

const pickCatalogFieldUpdates = (
  mediaType: MediaSyncMediaType,
  updates: Record<string, unknown>
): Record<string, unknown> => {
  const allowed = new Set(catalogFieldsForMediaType(mediaType));
  const picked: Record<string, unknown> = {};

  for (const [field, value] of Object.entries(updates)) {
    if (!allowed.has(field) || value === undefined) {
      continue;
    }
    picked[field] = value;
  }

  return picked;
};

/** Baseline JSON may store explicit null for any catalog field (including required). */
export const sanitizeBaselineUpdates = (
  mediaType: MediaSyncMediaType,
  updates: Record<string, unknown>
): Record<string, unknown> => pickCatalogFieldUpdates(mediaType, updates);

/** Catalog apply must not write null/undefined onto required Prisma columns. */
export const sanitizeCatalogApplyData = (
  mediaType: MediaSyncMediaType,
  updates: Record<string, unknown>
): Record<string, unknown> => {
  const picked = pickCatalogFieldUpdates(mediaType, updates);
  const sanitized: Record<string, unknown> = {};

  for (const [field, value] of Object.entries(picked)) {
    if (
      !isNullableCatalogField(mediaType, field) &&
      (value === null || value === undefined)
    ) {
      continue;
    }
    sanitized[field] = value;
  }

  return sanitized;
};

export const allCatalogFields = {
  ANIME: ANIME_CATALOG_FIELDS,
  MANGA: MANGA_CATALOG_FIELDS,
  LIGHT_NOVEL: LIGHT_NOVEL_CATALOG_FIELDS
} as const;
