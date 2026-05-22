"use client";

import { useMemo } from "react";

import type { MediaListClientConfig } from "@/types/context.type";

import { mapStatusCountsToTabFilters } from "@/hooks/map-status-tab-filters";
import { useQueryErrorToast } from "@/hooks/useQueryErrorToast";

import { PROGRESS_STATUS, SORT_ORDER } from "@/lib/enums";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

export const useMediaListHeader = <
  TItem extends { id: number },
  TFilters extends Record<string, unknown>,
  TListFilters extends Record<string, unknown>,
  TInfiniteQueryKey extends readonly unknown[]
>(
  config: MediaListClientConfig<TItem, TFilters, TListFilters, TInfiniteQueryKey>
) => {
  const { state, setState } = config.context.useMediaListContext();
  const { query, status, filters, sort, order } = state;

  const listFilters = useMemo(
    () => config.buildListFiltersFromState(state),
    [config, state]
  );

  const { data } = useInfiniteQuery(config.getInfiniteQueryOptions(listFilters));

  const metadata = data?.pages[0]?.metadata;

  const { data: statusCount, error: statusCountsError } = useQuery({
    queryKey: config.statusCounts.queryKey,
    queryFn: config.statusCounts.queryFn,
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

  const activeFiltersCount = config.activeFilterChips.filter(
    (chip) => filters[chip.key] !== undefined
  ).length;

  return {
    query,
    status,
    filters,
    sort,
    order,
    metadata,
    statusFilters,
    activeFiltersCount,
    handleSort,
    handleStatus
  };
};
