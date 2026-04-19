import { animeService } from "@/services/anime.service";

import { useMediaFilters } from "@/components/context/MediaFiltersContext";

import { mediaKeys } from "@/lib/query-keys";

import { useInfiniteQuery } from "@tanstack/react-query";

const PAGE_SIZE = 10;

export const useInfiniteAnimeList = (enabled = true) => {
  const { state } = useMediaFilters();

  return useInfiniteQuery({
    queryKey: mediaKeys.list(
      {
        page: 0,
        limit: PAGE_SIZE,
        query: state.query,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
        progressStatus: state.progressStatus,
        genre: state.genre,
        studio: state.studio,
        theme: state.theme,
        malScore: state.malScore,
        personalScore: state.personalScore,
        type: state.type,
        statusCheck: state.statusCheck
      },
      "anime"
    ),
    enabled,
    queryFn: async ({ pageParam }) => {
      const result = await animeService.fetchAll(
        pageParam as number,
        PAGE_SIZE,
        state.query,
        state.sortBy,
        state.sortOrder,
        state.genre,
        state.studio,
        state.theme,
        state.progressStatus as
          | "PLANNED"
          | "ON_HOLD"
          | "ON_PROGRESS"
          | "COMPLETED"
          | "DROPPED"
          | undefined,
        state.malScore,
        state.personalScore,
        state.type,
        state.statusCheck
      );
      return result;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, pageCount } = lastPage.metadata;
      return page < pageCount ? page + 1 : undefined;
    }
  });
};
