import { mangaService } from "@/services/manga.service";

import { useMediaFilters } from "@/components/context/MediaFiltersContext";

import { mediaKeys } from "@/lib/query-keys";

import { useQuery } from "@tanstack/react-query";

export const useMangaList = (enabled = true) => {
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
        author: state.author,
        theme: state.theme,
        malScore: state.malScore,
        personalScore: state.personalScore,
        statusCheck: state.statusCheck
      },
      "manga"
    ),
    enabled,
    queryFn: async () => {
      const result = await mangaService.list({
        page: state.page,
        limit: state.limit,
        query: state.query,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
        filterAuthor: state.author,
        filterGenre: state.genre,
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
        filterStatusCheck: state.statusCheck
      });
      if (!result.success) throw new Error(result.error);
      return result.data;
    }
  });
};
