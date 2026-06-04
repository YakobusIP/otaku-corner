import { animeService } from "@/services/anime.service";

import type { AnimeFilters, AnimeList } from "@/types/anime.type";
import type {
  MediaListInfiniteQueryOptionsFactory,
  MediaListQueryConfig,
  MediaListState
} from "@/types/context.type";

import { type ProgressStatusKey, SORT_ORDER } from "@/lib/shared/enums";
import {
  ANIME_LIST_PAGE_LIMIT,
  getAnimeListInfiniteQueryOptions
} from "@/lib/media-list/public-list-infinite-queries";
import {
  publicListKeys,
  type AnimeListInfiniteQueryKey,
  type PublicAnimeListInfiniteFilters
} from "@/lib/media-list/query-keys";

export const animeListQueryConfig: MediaListQueryConfig<
  AnimeList,
  AnimeFilters,
  PublicAnimeListInfiniteFilters,
  AnimeListInfiniteQueryKey
> = {
  id: "anime",
  getInfiniteQueryOptions:
    getAnimeListInfiniteQueryOptions satisfies MediaListInfiniteQueryOptionsFactory<
      AnimeList,
      PublicAnimeListInfiniteFilters,
      AnimeListInfiniteQueryKey
    >,
  statusCounts: {
    queryKey: publicListKeys.animeStatusCounts(),
    queryFn: () => animeService.fetchStatusCounts()
  },
  buildListFiltersFromState: (
    state: MediaListState<AnimeFilters>
  ): PublicAnimeListInfiniteFilters => ({
    limit: ANIME_LIST_PAGE_LIMIT,
    query: state.query ?? "",
    sort: state.sort ?? "title",
    order: state.order ?? SORT_ORDER.ASCENDING,
    genre: state.filters.genre,
    studio: state.filters.studio,
    theme: state.filters.theme,
    status: (state.status ?? "") as ProgressStatusKey | "",
    malScore: state.filters.malScore,
    personalScore: state.filters.personalScore,
    type: state.filters.type
  })
};
