"use client";

import { useMemo } from "react";

import type {
  EntityLookupResult,
  MediaListClientConfig
} from "@/types/context.type";

import { useLoadingDots } from "@/hooks/useLoadingDots";
import { useQueryErrorToast } from "@/hooks/useQueryErrorToast";

import { countActiveFilterChips } from "@/lib/media-list-helpers";

import { useInfiniteQuery, useQueries } from "@tanstack/react-query";

export const useMediaListBody = <
  TItem extends { id: number },
  TFilters extends Record<string, unknown>,
  TListFilters extends Record<string, unknown>,
  TInfiniteQueryKey extends readonly unknown[]
>(
  config: MediaListClientConfig<TItem, TFilters, TListFilters, TInfiniteQueryKey>
) => {
  const { state, setState, setQuery } = config.context.useMediaListContext();
  const { query, filters } = state;

  const listFilters = useMemo(
    () => config.buildListFiltersFromState(state),
    [config, state]
  );

  const listQuery = useInfiniteQuery(config.getInfiniteQueryOptions(listFilters));

  const {
    data,
    error,
    isPending,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = listQuery;

  const itemList = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data]
  );
  const metadata = data?.pages[0]?.metadata;

  useQueryErrorToast(error);

  const entityQueries = useQueries({
    queries: config.entityLookups.map((lookup) => ({
      queryKey: lookup.queryKey,
      queryFn: lookup.queryFn,
      refetchOnWindowFocus: false,
      staleTime: 24 * 60 * 60 * 1000
    }))
  });

  const entityLists = useMemo(() => {
    const result: EntityLookupResult = {};
    config.entityLookups.forEach((lookup, index) => {
      result[lookup.resultKey] = entityQueries[index]?.data;
    });
    return result;
  }, [config.entityLookups, entityQueries]);

  const removeFilter = <K extends keyof TFilters & string>(field: K) => {
    setState({
      filters: {
        ...filters,
        [field]: undefined
      } as TFilters
    });
  };

  const clearAllFilters = () => {
    config.clearAllFilters(setQuery, setState);
  };

  const browseAll = () => {
    config.browseAll(setQuery, setState);
  };

  const activeFiltersCount = countActiveFilterChips(
    config.activeFilterChips,
    filters
  );

  const loadingDots = useLoadingDots();

  return {
    query,
    filters,
    setQuery,
    itemList,
    metadata,
    isPending,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    entityLists,
    entityQueryErrors: entityQueries
      .map((entityQuery) => entityQuery.error)
      .filter((error) => error != null),
    removeFilter,
    clearAllFilters,
    browseAll,
    activeFiltersCount,
    loadingDots
  };
};
