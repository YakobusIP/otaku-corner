export type MediaSyncRunStatus = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
export type MediaSyncRunType = "SCHEDULED" | "MANUAL";
export type MediaSyncMediaType = "ANIME" | "MANGA" | "LIGHT_NOVEL";
export type MediaSyncItemOutcome =
  | "UPDATED"
  | "UNCHANGED"
  | "CONFLICT"
  | "FAILED"
  | "RESOLVED_ACCEPTED"
  | "RESOLVED_KEPT"
  | "RESOLVED_DISMISSED";

export type MediaSyncRunListItem = {
  id: string;
  type: MediaSyncRunType;
  status: MediaSyncRunStatus;
  startedAt: string | null;
  finishedAt: string | null;
  touchedCount: number;
  updatedCount: number;
  unchangedCount: number;
  conflictedCount: number;
  failedCount: number;
  createdAt: string;
};

export type MediaSyncConflict = {
  field: string;
  base: unknown;
  local: unknown;
  upstream: unknown;
  rule: string;
};

export type MediaSyncItem = {
  id: string;
  syncRunId?: string;
  mediaType: MediaSyncMediaType;
  mediaId: number;
  mediaTitle: string | null;
  outcome: MediaSyncItemOutcome;
  errorMessage: string | null;
  conflicts: MediaSyncConflict[] | null;
  pendingUpstream: Record<string, unknown> | null;
  baselineCatalog: Record<string, unknown> | null;
  fieldResolutions: Record<string, "accept_upstream" | "keep_local"> | null;
  version: number;
  isLegacyUntrusted?: boolean;
  resolvedAt: string | null;
  resolvedByUserId: number | null;
  createdAt: string;
};

export type PaginatedOpenMediaSyncConflicts = {
  data: MediaSyncItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type PaginatedMediaSyncRuns = {
  data: MediaSyncRunListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type MediaSyncRunDetail = MediaSyncRunListItem & {
  errorMessage: string | null;
  items: MediaSyncItem[];
  itemsTotal: number;
  itemsPage: number;
  itemsLimit: number;
  itemsTotalPages: number;
  relatedOpenConflicts: MediaSyncItem[];
  touchedMediaCount: number;
};
