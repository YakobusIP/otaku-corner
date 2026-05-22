import type { MediaListServerConfig } from "@/types/context.type";

import {
  MANGA_LIST_PAGE_LIMIT,
  buildMangaListFiltersFromSearchParams
} from "@/lib/public-list-infinite-queries";
import type { PublicMangaListInfiniteFilters } from "@/lib/query-keys";

export const mangaListServerConfig: MediaListServerConfig<PublicMangaListInfiniteFilters> =
  {
    id: "manga",
    pageLimit: MANGA_LIST_PAGE_LIMIT,
    buildListFiltersFromSearchParams: buildMangaListFiltersFromSearchParams
  };
