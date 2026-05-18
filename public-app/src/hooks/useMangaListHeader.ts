"use client";

import { useContext, useMemo } from "react";

import { mangaService } from "@/services/manga.service";

import { MangaContext } from "@/components/context/MangaContext";

import { mapStatusCountsToTabFilters } from "@/hooks/map-status-tab-filters";
import { useQueryErrorToast } from "@/hooks/useQueryErrorToast";

import {
  PROGRESS_STATUS,
  type ProgressStatusKey,
  SORT_ORDER
} from "@/lib/enums";
import {
  MANGA_LIST_PAGE_LIMIT,
  getMangaListInfiniteQueryOptions
} from "@/lib/public-list-infinite-queries";
import { publicListKeys } from "@/lib/query-keys";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

export const useMangaListHeader = () => {
  const context = useContext(MangaContext);
  if (!context) {
    throw new Error("useMangaListHeader must be used within an MangaProvider");
  }

  const { state, setState } = context;
  const { query, status, filters, sort, order } = state;

  const listFilters = useMemo(
    () => ({
      limit: MANGA_LIST_PAGE_LIMIT,
      query: query ?? "",
      sort: sort ?? "title",
      order: order ?? SORT_ORDER.ASCENDING,
      author: filters.author,
      genre: filters.genre,
      theme: filters.theme,
      status: (status ?? "") as ProgressStatusKey | "",
      malScore: filters.malScore,
      personalScore: filters.personalScore
    }),
    [
      query,
      sort,
      order,
      filters.author,
      filters.genre,
      filters.theme,
      status,
      filters.malScore,
      filters.personalScore
    ]
  );

  const { data } = useInfiniteQuery(
    getMangaListInfiniteQueryOptions(listFilters)
  );

  const mangaMetadata = data?.pages[0]?.metadata;

  const { data: statusCount, error: statusCountsError } = useQuery({
    queryKey: publicListKeys.mangaStatusCounts(),
    queryFn: () => mangaService.fetchStatusCounts(),
    refetchOnWindowFocus: false,
    staleTime: 24 * 60 * 60 * 1000
  });

  useQueryErrorToast(statusCountsError);

  const statusFilters = mapStatusCountsToTabFilters(statusCount);

  const handleSort = (key: string) => {
    setState({
      sort: key,
      order:
        sort === key
          ? order === SORT_ORDER.ASCENDING
            ? SORT_ORDER.DESCENDING
            : SORT_ORDER.ASCENDING
          : SORT_ORDER.ASCENDING
    });
  };

  const handleStatus = (value?: keyof typeof PROGRESS_STATUS) => {
    setState({
      status: value
    });
  };

  const activeFiltersCount = [
    filters.author,
    filters.genre,
    filters.theme,
    filters.malScore,
    filters.personalScore
  ].filter((f) => f !== undefined).length;

  return {
    query,
    status,
    filters,
    sort,
    order,
    mangaMetadata,
    statusFilters,
    activeFiltersCount,
    handleSort,
    handleStatus
  };
};
