"use client";

import { useContext, useMemo } from "react";

import { lightNovelService } from "@/services/lightnovel.service";

import { LightNovelContext } from "@/components/context/LightNovelContext";

import { mapStatusCountsToTabFilters } from "@/hooks/map-status-tab-filters";
import { useQueryErrorToast } from "@/hooks/useQueryErrorToast";

import {
  PROGRESS_STATUS,
  type ProgressStatusKey,
  SORT_ORDER
} from "@/lib/enums";
import {
  LIGHT_NOVEL_LIST_PAGE_LIMIT,
  getLightNovelListInfiniteQueryOptions
} from "@/lib/public-list-infinite-queries";
import { publicListKeys } from "@/lib/query-keys";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

export const useLightNovelListHeader = () => {
  const context = useContext(LightNovelContext);
  if (!context) {
    throw new Error(
      "useLightNovelListHeader must be used within a LightNovelProvider"
    );
  }

  const { state, setState } = context;
  const { query, status, filters, sort, order } = state;

  const listFilters = useMemo(
    () => ({
      limit: LIGHT_NOVEL_LIST_PAGE_LIMIT,
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
    getLightNovelListInfiniteQueryOptions(listFilters)
  );

  const lightNovelMetadata = data?.pages[0]?.metadata;

  const { data: statusCount, error: statusCountsError } = useQuery({
    queryKey: publicListKeys.lightNovelStatusCounts(),
    queryFn: () => lightNovelService.fetchStatusCounts(),
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
    lightNovelMetadata,
    statusFilters,
    activeFiltersCount,
    handleSort,
    handleStatus
  };
};
