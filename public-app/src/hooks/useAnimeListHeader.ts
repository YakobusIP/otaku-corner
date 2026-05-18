"use client";

import { useContext, useMemo } from "react";

import { animeService } from "@/services/anime.service";

import { AnimeContext } from "@/components/context/AnimeContext";

import { mapStatusCountsToTabFilters } from "@/hooks/map-status-tab-filters";
import { useQueryErrorToast } from "@/hooks/useQueryErrorToast";

import {
  PROGRESS_STATUS,
  type ProgressStatusKey,
  SORT_ORDER
} from "@/lib/enums";
import {
  ANIME_LIST_PAGE_LIMIT,
  getAnimeListInfiniteQueryOptions
} from "@/lib/public-list-infinite-queries";
import { publicListKeys } from "@/lib/query-keys";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

export const useAnimeListHeader = () => {
  const context = useContext(AnimeContext);
  if (!context) {
    throw new Error("useAnimeListHeader must be used within an AnimeProvider");
  }

  const { state, setState } = context;
  const { query, status, filters, sort, order } = state;

  const listFilters = useMemo(
    () => ({
      limit: ANIME_LIST_PAGE_LIMIT,
      query: query ?? "",
      sort: sort ?? "title",
      order: order ?? SORT_ORDER.ASCENDING,
      genre: filters.genre,
      studio: filters.studio,
      theme: filters.theme,
      status: (status ?? "") as ProgressStatusKey | "",
      malScore: filters.malScore,
      personalScore: filters.personalScore,
      type: filters.type
    }),
    [
      query,
      sort,
      order,
      filters.genre,
      filters.studio,
      filters.theme,
      status,
      filters.malScore,
      filters.personalScore,
      filters.type
    ]
  );

  const { data } = useInfiniteQuery(
    getAnimeListInfiniteQueryOptions(listFilters)
  );

  const animeMetadata = data?.pages[0]?.metadata;

  const { data: statusCount, error: statusCountsError } = useQuery({
    queryKey: publicListKeys.animeStatusCounts(),
    queryFn: () => animeService.fetchStatusCounts(),
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
    filters.genre,
    filters.studio,
    filters.theme,
    filters.malScore,
    filters.personalScore,
    filters.type
  ].filter((f) => f !== undefined).length;

  return {
    query,
    status,
    filters,
    sort,
    order,
    animeMetadata,
    statusFilters,
    activeFiltersCount,
    handleSort,
    handleStatus
  };
};
