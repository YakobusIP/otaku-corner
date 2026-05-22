import type { MediaListServerConfig } from "@/types/context.type";

import {
  LIGHT_NOVEL_LIST_PAGE_LIMIT,
  buildLightNovelListFiltersFromSearchParams
} from "@/lib/public-list-infinite-queries";
import type { PublicLightNovelListInfiniteFilters } from "@/lib/query-keys";

export const lightNovelListServerConfig: MediaListServerConfig<PublicLightNovelListInfiniteFilters> =
  {
    id: "lightNovel",
    pageLimit: LIGHT_NOVEL_LIST_PAGE_LIMIT,
    buildListFiltersFromSearchParams: buildLightNovelListFiltersFromSearchParams
  };
