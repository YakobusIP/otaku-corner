import { animeService } from "@/services/anime.service";
import { lightNovelService } from "@/services/lightnovel.service";
import { mangaService } from "@/services/manga.service";

import type { MetadataResponse } from "@/types/api.type";

import {
  PROGRESS_STATUS,
  type ProgressStatusKey,
  SORT_ORDER
} from "@/lib/enums";
import {
  type PublicAnimeListInfiniteFilters,
  type PublicLightNovelListInfiniteFilters,
  type PublicMangaListInfiniteFilters,
  publicListKeys
} from "@/lib/query-keys";

import type { QueryFunctionContext } from "@tanstack/react-query";

const PROGRESS_STATUS_QUERY_KEYS = new Set<string>(
  Object.keys(PROGRESS_STATUS) as ProgressStatusKey[]
);

export const coerceProgressStatusSearchParam = (
  raw: string | undefined
): ProgressStatusKey | "" => {
  if (raw === undefined || raw === "") {
    return "";
  }
  return PROGRESS_STATUS_QUERY_KEYS.has(raw) ? (raw as ProgressStatusKey) : "";
};

export type PublicListPage<T> = {
  data: T[];
  metadata: MetadataResponse;
};

export const getNestListNextPageParam = (
  lastPage: PublicListPage<unknown>
): number | undefined => {
  const { page, pageCount } = lastPage.metadata;
  if (page >= pageCount) {
    return undefined;
  }
  return page + 1;
};

const resolveProgressStatusParam = (
  status: ProgressStatusKey | "" | undefined
): keyof typeof PROGRESS_STATUS | undefined => {
  if (status === undefined || status === "") {
    return undefined;
  }
  if (!PROGRESS_STATUS_QUERY_KEYS.has(status)) {
    return undefined;
  }
  return status as keyof typeof PROGRESS_STATUS;
};

export const ANIME_LIST_PAGE_LIMIT = 10;
export const MANGA_LIST_PAGE_LIMIT = 15;
export const LIGHT_NOVEL_LIST_PAGE_LIMIT = 15;

export const getAnimeListInfiniteQueryOptions = (
  filters: PublicAnimeListInfiniteFilters
) => ({
  queryKey: publicListKeys.animeInfinite(filters),
  initialPageParam: 1,
  queryFn: ({
    pageParam
  }: QueryFunctionContext<
    ReturnType<typeof publicListKeys.animeInfinite>,
    number
  >) =>
    animeService.fetchAll(
      pageParam,
      filters.limit,
      filters.query || undefined,
      filters.sort,
      filters.order as SORT_ORDER,
      filters.genre,
      filters.studio,
      filters.theme,
      resolveProgressStatusParam(filters.status),
      filters.malScore,
      filters.personalScore,
      filters.type
    ),
  getNextPageParam: getNestListNextPageParam
});

export const getMangaListInfiniteQueryOptions = (
  filters: PublicMangaListInfiniteFilters
) => ({
  queryKey: publicListKeys.mangaInfinite(filters),
  initialPageParam: 1,
  queryFn: ({
    pageParam
  }: QueryFunctionContext<
    ReturnType<typeof publicListKeys.mangaInfinite>,
    number
  >) =>
    mangaService.fetchAll(
      pageParam,
      filters.limit,
      filters.query || undefined,
      filters.sort,
      filters.order as SORT_ORDER,
      filters.author,
      filters.genre,
      filters.theme,
      resolveProgressStatusParam(filters.status),
      filters.malScore,
      filters.personalScore
    ),
  getNextPageParam: getNestListNextPageParam
});

export const getLightNovelListInfiniteQueryOptions = (
  filters: PublicLightNovelListInfiniteFilters
) => ({
  queryKey: publicListKeys.lightNovelInfinite(filters),
  initialPageParam: 1,
  queryFn: ({
    pageParam
  }: QueryFunctionContext<
    ReturnType<typeof publicListKeys.lightNovelInfinite>,
    number
  >) =>
    lightNovelService.fetchAll(
      pageParam,
      filters.limit,
      filters.query || undefined,
      filters.sort,
      filters.order as SORT_ORDER,
      filters.author,
      filters.genre,
      filters.theme,
      resolveProgressStatusParam(filters.status),
      filters.malScore,
      filters.personalScore
    ),
  getNextPageParam: getNestListNextPageParam
});

export const buildAnimeListFiltersFromSearchParams = (params: {
  q?: string;
  status?: string;
}): PublicAnimeListInfiniteFilters => ({
  limit: ANIME_LIST_PAGE_LIMIT,
  query: params.q ?? "",
  sort: "title",
  order: SORT_ORDER.ASCENDING,
  genre: undefined,
  studio: undefined,
  theme: undefined,
  status: coerceProgressStatusSearchParam(params.status),
  malScore: undefined,
  personalScore: undefined,
  type: undefined
});

export const buildMangaListFiltersFromSearchParams = (params: {
  q?: string;
  status?: string;
}): PublicMangaListInfiniteFilters => ({
  limit: MANGA_LIST_PAGE_LIMIT,
  query: params.q ?? "",
  sort: "title",
  order: SORT_ORDER.ASCENDING,
  author: undefined,
  genre: undefined,
  theme: undefined,
  status: coerceProgressStatusSearchParam(params.status),
  malScore: undefined,
  personalScore: undefined
});

export const buildLightNovelListFiltersFromSearchParams = (params: {
  q?: string;
  status?: string;
}): PublicLightNovelListInfiniteFilters => ({
  limit: LIGHT_NOVEL_LIST_PAGE_LIMIT,
  query: params.q ?? "",
  sort: "title",
  order: SORT_ORDER.ASCENDING,
  author: undefined,
  genre: undefined,
  theme: undefined,
  status: coerceProgressStatusSearchParam(params.status),
  malScore: undefined,
  personalScore: undefined
});
