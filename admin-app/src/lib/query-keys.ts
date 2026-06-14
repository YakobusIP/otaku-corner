import { STATISTICS_VIEW } from "@/lib/enums";

import type { ImageVaultInfiniteListFilters } from "@/types/image-vault.type";

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
  malDuplicate: (type: "anime" | "manga" | "lightNovel", malId: number) =>
    [...mediaKeys.malDuplicates(), type, malId] as const
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

export const imageVaultKeys = {
  all: ["imageVault"] as const,
  lists: () => [...imageVaultKeys.all, "list"] as const,
  infiniteList: (filters: ImageVaultInfiniteListFilters) =>
    [...imageVaultKeys.lists(), "infinite", filters] as const,
  details: () => [...imageVaultKeys.all, "detail"] as const,
  detail: (id: string) => [...imageVaultKeys.all, "detail", id] as const,
  models: () => [...imageVaultKeys.all, "models"] as const,
  categories: () => [...imageVaultKeys.all, "categories"] as const
};

export const statisticKeys = {
  all: ["statistic"] as const,
  yearRange: () => [...statisticKeys.all, "year-range"] as const,
  dashboardKpis: (yearScope: number | "all") =>
    [...statisticKeys.all, "dashboard-kpis", yearScope] as const,
  topRatedThisYear: (yearScope: number | "all") =>
    [...statisticKeys.all, "top-rated", yearScope] as const,
  libraryHealth: () => [...statisticKeys.all, "library-health"] as const,
  tasteProfile: (limit: number) =>
    [...statisticKeys.all, "taste-profile", limit] as const,
  recentReviews: (limit: number) =>
    [...statisticKeys.all, "recent-reviews", limit] as const,
  mediaConsumption: (view: STATISTICS_VIEW, yearOrAllYears: string) =>
    [...statisticKeys.all, "media-consumption", view, yearOrAllYears] as const
};
