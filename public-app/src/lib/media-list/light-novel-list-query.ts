import { lightNovelService } from "@/services/lightnovel.service";

import type {
  MediaListInfiniteQueryOptionsFactory,
  MediaListQueryConfig,
  MediaListState
} from "@/types/context.type";
import type { LightNovelFilters, LightNovelList } from "@/types/lightnovel.type";

import { type ProgressStatusKey, SORT_ORDER } from "@/lib/shared/enums";
import {
  LIGHT_NOVEL_LIST_PAGE_LIMIT,
  getLightNovelListInfiniteQueryOptions
} from "@/lib/media-list/public-list-infinite-queries";
import {
  publicListKeys,
  type LightNovelListInfiniteQueryKey,
  type PublicLightNovelListInfiniteFilters
} from "@/lib/media-list/query-keys";

export const lightNovelListQueryConfig: MediaListQueryConfig<
  LightNovelList,
  LightNovelFilters,
  PublicLightNovelListInfiniteFilters,
  LightNovelListInfiniteQueryKey
> = {
  id: "lightNovel",
  getInfiniteQueryOptions:
    getLightNovelListInfiniteQueryOptions satisfies MediaListInfiniteQueryOptionsFactory<
      LightNovelList,
      PublicLightNovelListInfiniteFilters,
      LightNovelListInfiniteQueryKey
    >,
  statusCounts: {
    queryKey: publicListKeys.lightNovelStatusCounts(),
    queryFn: () => lightNovelService.fetchStatusCounts()
  },
  buildListFiltersFromState: (
    state: MediaListState<LightNovelFilters>
  ): PublicLightNovelListInfiniteFilters => ({
    limit: LIGHT_NOVEL_LIST_PAGE_LIMIT,
    query: state.query ?? "",
    sort: state.sort ?? "title",
    order: state.order ?? SORT_ORDER.ASCENDING,
    author: state.filters.author,
    genre: state.filters.genre,
    theme: state.filters.theme,
    status: (state.status ?? "") as ProgressStatusKey | "",
    malScore: state.filters.malScore,
    personalScore: state.filters.personalScore
  })
};
