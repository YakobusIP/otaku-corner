import type { ProgressStatusKey } from "@/lib/enums";

const root = ["publicMediaLists"] as const;

export type PublicAnimeListInfiniteFilters = {
  limit: number;
  query: string;
  sort: string;
  order: string;
  genre?: number;
  studio?: number;
  theme?: number;
  status?: ProgressStatusKey | "";
  malScore?: string;
  personalScore?: string;
  type?: string;
};

export type PublicMangaListInfiniteFilters = {
  limit: number;
  query: string;
  sort: string;
  order: string;
  author?: number;
  genre?: number;
  theme?: number;
  status?: ProgressStatusKey | "";
  malScore?: string;
  personalScore?: string;
};

export type PublicLightNovelListInfiniteFilters = {
  limit: number;
  query: string;
  sort: string;
  order: string;
  author?: number;
  genre?: number;
  theme?: number;
  status?: ProgressStatusKey | "";
  malScore?: string;
  personalScore?: string;
};

export const publicListKeys = {
  all: root,
  animeInfinite: (filters: PublicAnimeListInfiniteFilters) =>
    [...root, "anime", "infinite", filters] as const,
  mangaInfinite: (filters: PublicMangaListInfiniteFilters) =>
    [...root, "manga", "infinite", filters] as const,
  lightNovelInfinite: (filters: PublicLightNovelListInfiniteFilters) =>
    [...root, "lightNovel", "infinite", filters] as const,
  animeStatusCounts: () => [...root, "anime", "statusCounts"] as const,
  mangaStatusCounts: () => [...root, "manga", "statusCounts"] as const,
  lightNovelStatusCounts: () => [...root, "lightNovel", "statusCounts"] as const
};
