export type MediaTypeFilter = "all" | "anime" | "manga" | "lightNovel";

export type MediaFilters = {
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
    [...mediaKeys.all, "statusCounts", type] as const,
  malDuplicates: () => [...mediaKeys.all, "malDuplicate"] as const,
  malDuplicate: (
    type: "anime" | "manga" | "lightNovel",
    malId: number
  ) => [...mediaKeys.malDuplicates(), type, malId] as const
};

export const entityKeys = {
  all: ["entities"] as const,
  genres: () => [...entityKeys.all, "genres"] as const,
  studios: () => [...entityKeys.all, "studios"] as const,
  themes: () => [...entityKeys.all, "themes"] as const,
  authors: () => [...entityKeys.all, "authors"] as const
};

export const detailKeys = {
  anime: (id: number) => [...mediaKeys.all, "anime", id] as const,
  manga: (id: number) => [...mediaKeys.all, "manga", id] as const,
  lightNovel: (id: number) => [...mediaKeys.all, "lightNovel", id] as const
};
