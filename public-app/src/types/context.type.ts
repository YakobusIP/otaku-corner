import type { ReactNode } from "react";

import type { PROGRESS_STATUS, SORT_ORDER } from "@/lib/enums";
import type { PublicListPage } from "@/lib/public-list-infinite-queries";

import type { QueryFunction } from "@tanstack/react-query";

export type MediaListId = "anime" | "manga" | "lightNovel";

export type MediaListState<TFilters extends Record<string, unknown>> = {
  query: string;
  status?: keyof typeof PROGRESS_STATUS;
  filters: TFilters;
  sort: string;
  order: SORT_ORDER;
};

export type MediaListContextValue<TFilters extends Record<string, unknown>> = {
  state: MediaListState<TFilters>;
  setQuery: (query: string) => void;
  setState: (update: Partial<Omit<MediaListState<TFilters>, "query">>) => void;
};

export type MediaListContextBundle<TFilters extends Record<string, unknown>> = {
  useMediaListContext: () => MediaListContextValue<TFilters>;
  Provider: ({ children }: { children: ReactNode }) => ReactNode;
};

export type EntityLookupResult = Record<
  string,
  { id: number; name: string }[] | undefined
>;

export type EntityLookupConfig = {
  resultKey: string;
  queryKey: readonly unknown[];
  queryFn: () => Promise<{ id: number; name: string }[]>;
};

export type FilterFieldConfig<TFilters extends Record<string, unknown>> = {
  label: string;
  render: (
    filters: TFilters,
    handleFilter: <K extends keyof TFilters & string>(
      field: K
    ) => (value?: number | string) => void
  ) => ReactNode;
};

export type ActiveFilterChipConfig<TFilters extends Record<string, unknown>> = {
  key: keyof TFilters & string;
  label: string;
  capitalize?: boolean;
  resolveEntityName?: {
    listKey: string;
    unknownLabel: string;
  };
};

export type MediaListInfiniteQueryOptionsFactory<
  TItem extends { id: number },
  TListFilters extends Record<string, unknown>,
  TQueryKey extends readonly unknown[]
> = (filters: TListFilters) => {
  queryKey: TQueryKey;
  initialPageParam: number;
  queryFn: QueryFunction<PublicListPage<TItem>, TQueryKey, number>;
  getNextPageParam: (lastPage: PublicListPage<TItem>) => number | undefined;
};

export type MediaListQueryConfig<
  TItem extends { id: number },
  TFilters extends Record<string, unknown>,
  TListFilters extends Record<string, unknown>,
  TInfiniteQueryKey extends readonly unknown[] = readonly unknown[]
> = {
  id: MediaListId;
  buildListFiltersFromState: (state: MediaListState<TFilters>) => TListFilters;
  getInfiniteQueryOptions: MediaListInfiniteQueryOptionsFactory<
    TItem,
    TListFilters,
    TInfiniteQueryKey
  >;
  statusCounts: {
    queryKey: readonly unknown[];
    queryFn: () => Promise<{ label: string; count: number }[]>;
  };
};

export type MediaListServerConfig<TListFilters extends Record<string, unknown>> = {
  id: MediaListId;
  pageLimit: number;
  buildListFiltersFromSearchParams: (params: {
    q?: string;
    status?: string;
  }) => TListFilters;
};

export type MediaListClientConfig<
  TItem extends { id: number },
  TFilters extends Record<string, unknown>,
  TListFilters extends Record<string, unknown>,
  TInfiniteQueryKey extends readonly unknown[] = readonly unknown[]
> = MediaListQueryConfig<
  TItem,
  TFilters,
  TListFilters,
  TInfiniteQueryKey
> & {
  searchPlaceholder: string;
  header: {
    title: string;
    countNoun: string;
    layoutGroupId: string;
    statusHighlightLayoutId: string;
  };
  list: {
    loadingImageAlt: string;
    loadingTitle: string;
    emptyTitle: string;
    emptyDescription: string;
    browseAllLabel: string;
  };
  context: MediaListContextBundle<TFilters>;
  entityLookups: EntityLookupConfig[];
  filterFields: FilterFieldConfig<TFilters>[];
  activeFilterChips: ActiveFilterChipConfig<TFilters>[];
  clearAllFilters: (
    setQuery: (query: string) => void,
    setState: MediaListContextValue<TFilters>["setState"]
  ) => void;
  browseAll: (
    setQuery: MediaListContextValue<TFilters>["setQuery"],
    setState: MediaListContextValue<TFilters>["setState"]
  ) => void;
  renderCard: (item: TItem) => ReactNode;
};
