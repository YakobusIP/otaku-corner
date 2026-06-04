import type { MediaListServerConfig } from "@/types/context.type";

import {
  ANIME_LIST_PAGE_LIMIT,
  buildAnimeListFiltersFromSearchParams
} from "@/lib/media-list/public-list-infinite-queries";
import type { PublicAnimeListInfiniteFilters } from "@/lib/media-list/query-keys";

export const animeListServerConfig: MediaListServerConfig<PublicAnimeListInfiniteFilters> =
  {
    id: "anime",
    pageLimit: ANIME_LIST_PAGE_LIMIT,
    buildListFiltersFromSearchParams: buildAnimeListFiltersFromSearchParams
  };
