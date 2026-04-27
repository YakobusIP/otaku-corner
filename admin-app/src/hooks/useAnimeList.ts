import { animeService } from "@/services/anime.service";

import { useMediaFilters } from "@/components/context/MediaFiltersContext";

import type { ProgressStatusKey } from "@/lib/enums";
import { mediaKeys } from "@/lib/query-keys";

import { useQuery } from "@tanstack/react-query";

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
    queryFn: async () => {
      const result = await animeService.list({
        page: state.page,
        limit: state.limit,
        query: state.query,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
        filterGenre: state.genre,
        filterStudio: state.studio,
        filterTheme: state.theme,
        filterProgressStatus: state.progressStatus as
          | ProgressStatusKey
          | undefined,
        filterMALScore: state.malScore,
        filterPersonalScore: state.personalScore,
        filterType: state.type,
        filterStatusCheck: state.statusCheck
      });
      if (!result.success) throw new Error(result.error);
      return result.data;
    }
  });
};
