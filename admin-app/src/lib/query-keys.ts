export type MediaTypeFilter = "all" | "anime" | "manga" | "lightNovel";

export type MediaFilters = {
  page: number;
  limit: number;
  query?: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
  progressStatus?: string;
  genre?: number;
  studio?: number;
  theme?: number;
  author?: number;
  malScore?: string;
  personalScore?: string;
  type?: string;
  statusCheck?: string;
};

export const mediaKeys = {
  all: ["media"] as const,
  lists: () => [...mediaKeys.all, "list"] as const,
  list: (filters: MediaFilters, mediaType: MediaTypeFilter) =>
    [...mediaKeys.lists(), mediaType, filters] as const,
  statusCounts: (type: "anime" | "manga" | "lightNovel") =>
    [...mediaKeys.all, "statusCounts", type] as const
};
