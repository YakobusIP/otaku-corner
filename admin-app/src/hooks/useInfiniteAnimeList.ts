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
      const result = await animeService.list({
        page: pageParam as number,
        limit: PAGE_SIZE,
        query: state.query,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
        filterGenre: state.genre,
        filterStudio: state.studio,
        filterTheme: state.theme,
        filterProgressStatus: state.progressStatus as
          | "PLANNED"
          | "ON_HOLD"
          | "ON_PROGRESS"
          | "COMPLETED"
          | "DROPPED"
          | undefined,
        filterMALScore: state.malScore,
        filterPersonalScore: state.personalScore,
        filterType: state.type,
        filterStatusCheck: state.statusCheck
      });
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, pageCount } = lastPage.metadata;
      return page < pageCount ? page + 1 : undefined;
    }
  });
};
