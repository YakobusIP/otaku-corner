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
    queryFn: () =>
      mangaService.fetchAll(
        state.page,
        state.limit,
        state.query,
        state.sortBy,
        state.sortOrder,
        state.author,
        state.genre,
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
        state.statusCheck
      )
  });
};
