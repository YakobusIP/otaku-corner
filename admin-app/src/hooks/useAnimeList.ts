import { useQuery } from "@tanstack/react-query";

import { useMediaFilters } from "@/components/context/MediaFiltersContext";
import { mediaKeys } from "@/lib/query-keys";
import { animeService } from "@/services/anime.service";

export const useAnimeList = (enabled = true) => {
  const { state } = useMediaFilters();

  return useQuery({
    queryKey: mediaKeys.list(
      {
        page: state.page,
        limit: state.limit,
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
    queryFn: () =>
      animeService.fetchAll(
        state.page,
        state.limit,
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
      )
  });
};
