import { mangaService } from "@/services/manga.service";

import type {
  MediaListInfiniteQueryOptionsFactory,
  MediaListQueryConfig,
  MediaListState
} from "@/types/context.type";
import type { MangaFilters, MangaList } from "@/types/manga.type";

import { type ProgressStatusKey, SORT_ORDER } from "@/lib/shared/enums";
import {
  MANGA_LIST_PAGE_LIMIT,
  getMangaListInfiniteQueryOptions
} from "@/lib/media-list/public-list-infinite-queries";
import {
  publicListKeys,
  type MangaListInfiniteQueryKey,
  type PublicMangaListInfiniteFilters
} from "@/lib/media-list/query-keys";

export const mangaListQueryConfig: MediaListQueryConfig<
  MangaList,
  MangaFilters,
  PublicMangaListInfiniteFilters,
  MangaListInfiniteQueryKey
> = {
  id: "manga",
  getInfiniteQueryOptions:
    getMangaListInfiniteQueryOptions satisfies MediaListInfiniteQueryOptionsFactory<
      MangaList,
      PublicMangaListInfiniteFilters,
      MangaListInfiniteQueryKey
    >,
  statusCounts: {
    queryKey: publicListKeys.mangaStatusCounts(),
    queryFn: () => mangaService.fetchStatusCounts()
  },
  buildListFiltersFromState: (
    state: MediaListState<MangaFilters>
  ): PublicMangaListInfiniteFilters => ({
    limit: MANGA_LIST_PAGE_LIMIT,
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
