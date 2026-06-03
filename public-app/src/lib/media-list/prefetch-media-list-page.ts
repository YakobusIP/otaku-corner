import type {
  EntityLookupConfig,
  MediaListQueryConfig
} from "@/types/context.type";

import { QueryClient } from "@tanstack/react-query";

const ENTITY_LOOKUP_STALE_TIME = 24 * 60 * 60 * 1000;

export const prefetchMediaListPage = async <
  TItem extends { id: number },
  TFilters extends Record<string, unknown>,
  TListFilters extends Record<string, unknown>,
  TInfiniteQueryKey extends readonly unknown[]
>(
  queryClient: QueryClient,
  {
    listFilters,
    queryConfig,
    entityLookups
  }: {
    listFilters: TListFilters;
    queryConfig: MediaListQueryConfig<
      TItem,
      TFilters,
      TListFilters,
      TInfiniteQueryKey
    >;
    entityLookups: EntityLookupConfig[];
  }
) => {
  await Promise.all([
    queryClient.prefetchInfiniteQuery(
      queryConfig.getInfiniteQueryOptions(listFilters)
    ),
    queryClient
      .prefetchQuery({
        queryKey: queryConfig.statusCounts.queryKey,
        queryFn: queryConfig.statusCounts.queryFn,
        staleTime: Infinity,
        retry: false
      })
      .catch((error) => {
        console.error("Failed to prefetch status counts:", error);
      }),
    ...(entityLookups ?? []).map((lookup) =>
      queryClient
        .prefetchQuery({
          queryKey: lookup.queryKey,
          queryFn: lookup.queryFn,
          staleTime: ENTITY_LOOKUP_STALE_TIME
        })
        .catch((error) => {
          console.error(`Failed to prefetch entity lookup [${lookup.queryKey.join("/")}]:`, error);
        })
    )
  ]);
};
