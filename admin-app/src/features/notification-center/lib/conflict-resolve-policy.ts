import type { MediaSyncConflict } from "@/types/media-sync.type";
import type { MediaSyncMediaType } from "@/types/media-sync.type";

const NULLABLE_FIELDS: Record<MediaSyncMediaType, ReadonlySet<string>> = {
  ANIME: new Set(["season", "episodesCount", "score", "trailer"]),
  MANGA: new Set(["chaptersCount", "volumesCount", "score"]),
  LIGHT_NOVEL: new Set(["volumesCount", "score"])
};

export const isRequiredNullClearConflict = (
  mediaType: MediaSyncMediaType,
  conflict: Pick<MediaSyncConflict, "field" | "rule" | "upstream">
): boolean =>
  conflict.rule === "null_clear" &&
  !NULLABLE_FIELDS[mediaType].has(conflict.field) &&
  (conflict.upstream === null || conflict.upstream === undefined);

export const listBlockedAcceptUpstreamFields = (
  mediaType: MediaSyncMediaType,
  conflicts: readonly Pick<MediaSyncConflict, "field" | "rule" | "upstream">[]
): string[] =>
  conflicts
    .filter((conflict) => isRequiredNullClearConflict(mediaType, conflict))
    .map((conflict) => conflict.field);

export const buildBulkFieldChoiceMap = (
  mediaType: MediaSyncMediaType,
  conflicts: readonly Pick<MediaSyncConflict, "field" | "rule" | "upstream">[],
  choice: "accept_upstream" | "keep_local"
): Record<string, "accept_upstream" | "keep_local"> => {
  const blockedAcceptFields = new Set(
    listBlockedAcceptUpstreamFields(mediaType, conflicts)
  );
  const next: Record<string, "accept_upstream" | "keep_local"> = {};

  for (const conflict of conflicts) {
    if (choice === "accept_upstream" && blockedAcceptFields.has(conflict.field)) {
      continue;
    }
    next[conflict.field] = choice;
  }

  return next;
};
