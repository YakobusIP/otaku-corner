import type { AuditLogItem } from "@/types/audit-log.type";

const FIELD_LABELS: Record<string, string> = {
  type: "Type",
  status: "Status",
  rating: "Rating",
  season: "Season",
  title: "Title",
  titleJapanese: "Japanese title",
  titleSynonyms: "Title synonyms",
  source: "Source",
  aired: "Aired",
  broadcast: "Broadcast",
  published: "Published",
  episodesCount: "Episodes",
  chaptersCount: "Chapters",
  volumesCount: "Volumes",
  volumeProgress: "Volume progress",
  duration: "Duration",
  score: "MAL score",
  images: "Images",
  synopsis: "Synopsis",
  trailer: "Trailer",
  malUrl: "MAL URL",
  deletedAt: "Deleted at"
};

const MAX_SUMMARY_CHANGES = 2;
const MAX_VALUE_LENGTH = 48;

const SYNC_CONFLICT_LIFECYCLE_KEYS = [
  "_syncConflictRefresh",
  "_syncLegacyConflictRefresh",
  "_syncConflictAutoClose",
  "_syncConflictDismissed"
] as const;

type SyncConflictLifecycleKey = (typeof SYNC_CONFLICT_LIFECYCLE_KEYS)[number];

const SYNC_CONFLICT_LIFECYCLE_LABELS: Record<SyncConflictLifecycleKey, string> =
  {
    _syncConflictRefresh: "Sync conflict refresh",
    _syncLegacyConflictRefresh: "Legacy sync conflict refresh",
    _syncConflictAutoClose: "Sync conflict auto-close",
    _syncConflictDismissed: "Sync conflict dismissed"
  };

export type AuditFieldChange = {
  field: string;
  label: string;
  before: unknown;
  after: unknown;
  sentence: string;
};

export const getAuditFieldLabel = (field: string): string => {
  if (FIELD_LABELS[field]) {
    return FIELD_LABELS[field];
  }

  return field
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (char) => char.toUpperCase());
};

export const formatAuditValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return "empty";
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      return "empty";
    }
    return truncate(trimmed);
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return "empty";
    }
    if (value.every((item) => typeof item === "string" || typeof item === "number")) {
      return truncate(value.join(", "));
    }
    return truncate(`${value.length} items`);
  }

  if (typeof value === "object") {
    return truncate(JSON.stringify(value));
  }

  return truncate(String(value));
};

const formatSyncOutcome = (outcome: unknown): string => {
  if (typeof outcome !== "string") {
    return formatAuditValue(outcome);
  }

  switch (outcome) {
    case "RESOLVED_ACCEPTED":
      return "Accepted upstream";
    case "RESOLVED_KEPT":
      return "Kept local";
    case "RESOLVED_DISMISSED":
      return "Dismissed";
    default:
      return outcome.replace(/_/g, " ").toLowerCase();
  }
};

const formatOpenConflictFields = (openFields: unknown): string => {
  if (!Array.isArray(openFields) || openFields.length === 0) {
    return "no open fields";
  }

  return openFields
    .filter((field): field is string => typeof field === "string")
    .map(getAuditFieldLabel)
    .join(", ");
};

const buildSyncConflictLifecycleSentence = (
  key: SyncConflictLifecycleKey,
  before: Record<string, unknown> | undefined,
  after: Record<string, unknown> | undefined
): string => {
  switch (key) {
    case "_syncConflictRefresh":
    case "_syncLegacyConflictRefresh": {
      const prefix =
        key === "_syncConflictRefresh"
          ? "Sync conflict refreshed"
          : "Legacy sync conflict refreshed";
      const openFields = formatOpenConflictFields(after?.openFields);
      const versionNote = after?.versionBumped ? " (version bumped)" : "";
      return `${prefix}: ${openFields}${versionNote}`;
    }
    case "_syncConflictAutoClose":
      return `Sync conflict auto-closed: ${formatSyncOutcome(after?.outcome)}`;
    case "_syncConflictDismissed": {
      const reason =
        typeof before?.reason === "string"
          ? before.reason.replace(/_/g, " ")
          : "unknown reason";
      return `Sync conflict dismissed (${reason}): ${formatSyncOutcome(after?.outcome)}`;
    }
  }
};

const listSyncConflictLifecycleChanges = (
  log: Pick<AuditLogItem, "before" | "after">
): AuditFieldChange[] | null => {
  for (const key of SYNC_CONFLICT_LIFECYCLE_KEYS) {
    const before = log.before?.[key] as Record<string, unknown> | undefined;
    const after = log.after?.[key] as Record<string, unknown> | undefined;
    if (!before && !after) {
      continue;
    }

    return [
      {
        field: key,
        label: SYNC_CONFLICT_LIFECYCLE_LABELS[key],
        before: before ?? null,
        after: after ?? null,
        sentence: buildSyncConflictLifecycleSentence(key, before, after)
      }
    ];
  }

  return null;
};

export const listAuditFieldChanges = (
  log: Pick<AuditLogItem, "action" | "before" | "after">
): AuditFieldChange[] => {
  const syncConflictLifecycle = listSyncConflictLifecycleChanges(log);
  if (syncConflictLifecycle) {
    return syncConflictLifecycle;
  }

  const syncResolution =
    (log.after?._syncResolution as Record<string, unknown> | undefined) ??
    (log.before?._syncResolution as Record<string, unknown> | undefined);
  if (syncResolution) {
    const field =
      typeof syncResolution.field === "string" ? syncResolution.field : "field";
    const label = getAuditFieldLabel(field);
    const choice =
      syncResolution.choice === "accept_upstream"
        ? "Accepted upstream"
        : "Kept local";
    const kept = formatAuditValue(syncResolution.kept);
    const upstream = formatAuditValue(syncResolution.upstream);
    return [
      {
        field: "_syncResolution",
        label: "Sync resolution",
        before: log.before?._syncResolution ?? null,
        after: log.after?._syncResolution ?? null,
        sentence: `${label}: ${choice} (kept ${kept}, upstream ${upstream})`
      }
    ];
  }

  if (log.action === "CREATE") {
    return Object.entries(log.after ?? {})
      .filter(([, value]) => value !== null && value !== undefined)
      .map(([field, value]) => {
        const label = getAuditFieldLabel(field);
        return {
          field,
          label,
          before: null,
          after: value,
          sentence: `${label} set to ${formatAuditValue(value)}`
        };
      });
  }

  if (log.action === "DELETE") {
    return Object.entries(log.before ?? {})
      .filter(([, value]) => value !== null && value !== undefined)
      .slice(0, 6)
      .map(([field, value]) => {
        const label = getAuditFieldLabel(field);
        return {
          field,
          label,
          before: value,
          after: null,
          sentence: `${label} was ${formatAuditValue(value)}`
        };
      });
  }

  const keys = Array.from(
    new Set([
      ...Object.keys(log.before ?? {}),
      ...Object.keys(log.after ?? {})
    ])
  );

  const changes: AuditFieldChange[] = [];
  for (const field of keys) {
    if (field.startsWith("_")) {
      continue;
    }
    const before = log.before?.[field] ?? null;
    const after = log.after?.[field] ?? null;
    if (JSON.stringify(before) === JSON.stringify(after)) {
      continue;
    }
    const label = getAuditFieldLabel(field);
    changes.push({
      field,
      label,
      before,
      after,
      sentence: `${label} changed from ${formatAuditValue(before)} to ${formatAuditValue(after)}`
    });
  }

  return changes;
};

export const formatAuditChangeSummary = (
  log: Pick<AuditLogItem, "action" | "before" | "after">
): string => {
  const changes = listAuditFieldChanges(log);

  if (log.action === "DELETE" && changes.length === 0) {
    return "Deleted";
  }

  if (changes.length === 0) {
    return "—";
  }

  const visible = changes.slice(0, MAX_SUMMARY_CHANGES);
  const suffix =
    changes.length > MAX_SUMMARY_CHANGES
      ? ` (+${changes.length - MAX_SUMMARY_CHANGES} more)`
      : "";

  return visible.map((change) => change.sentence).join("; ") + suffix;
};

const truncate = (value: string): string => {
  if (value.length <= MAX_VALUE_LENGTH) {
    return value;
  }
  return `${value.slice(0, MAX_VALUE_LENGTH - 1)}…`;
};
