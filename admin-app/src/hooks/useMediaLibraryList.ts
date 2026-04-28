import { animeService } from "@/services/anime.service";
import { lightNovelService } from "@/services/light-novel.service";
import { mangaService } from "@/services/manga.service";
import { mediaLibraryService } from "@/services/media-library.service";

import { useMediaFilters } from "@/components/context/MediaFiltersContext";

import type { PaginatedListPage } from "@/types/general.type";
import type { MediaLibraryListItem } from "@/types/media-library.type";

import type { ProgressStatusKey } from "@/lib/enums";
import { mediaKeys, type MediaFilters } from "@/lib/query-keys";

import { useInfiniteQuery } from "@tanstack/react-query";

const PAGE_SIZE = 10;

export const useMediaLibraryList = (enabled = true) => {
  const { state } = useMediaFilters();

  const isAll = state.mediaType === "all";

  const listFilters: MediaFilters = {
    limit: PAGE_SIZE,
    query: state.query,
    sortBy: state.sortBy,
    sortOrder: state.sortOrder,
    progressStatus: state.progressStatus,
    genre: state.genre,
    studio: state.studio,
    theme: state.theme,
    author: state.author,
    type: state.type,
    malScore: state.malScore,
    personalScore: state.personalScore,
    statusCheck: state.statusCheck
  };

  return useInfiniteQuery({
    queryKey: mediaKeys.list(listFilters, state.mediaType),
    enabled,
    queryFn: async ({
      pageParam
    }): Promise<PaginatedListPage<MediaLibraryListItem>> => {
      const page = pageParam as number;
      const filterProgress = state.progressStatus as
        | ProgressStatusKey
        | undefined;

      if (isAll) {
        const result = await mediaLibraryService.list({
          page,
          limit: PAGE_SIZE,
          filterQuery: state.query,
          sortBy: state.sortBy,
          sortOrder: state.sortOrder,
          filterProgressStatus: state.progressStatus,
          filterGenre: state.genre,
          filterStudio: state.studio,
          filterTheme: state.theme,
          filterAuthor: state.author,
          filterType: state.type,
          filterMALScore: state.malScore,
          filterPersonalScore: state.personalScore,
          filterStatusCheck: state.statusCheck
        });
        if (!result.success) throw new Error(result.error);
        return result.data;
      }

      if (state.mediaType === "anime") {
        const result = await animeService.list({
          page,
          limit: PAGE_SIZE,
          query: state.query,
          sortBy: state.sortBy,
          sortOrder: state.sortOrder,
          filterGenre: state.genre,
          filterStudio: state.studio,
          filterTheme: state.theme,
          filterProgressStatus: filterProgress,
          filterMALScore: state.malScore,
          filterPersonalScore: state.personalScore,
          filterType: state.type,
          filterStatusCheck: state.statusCheck
        });
        if (!result.success) throw new Error(result.error);
        return {
          data: result.data.data.map((item) => ({
            ...item,
            mediaType: "anime" as const
          })),
          metadata: result.data.metadata
        };
      }

      if (state.mediaType === "manga") {
        const result = await mangaService.list({
          page,
          limit: PAGE_SIZE,
          query: state.query,
          sortBy: state.sortBy,
          sortOrder: state.sortOrder,
          filterAuthor: state.author,
          filterGenre: state.genre,
          filterTheme: state.theme,
          filterProgressStatus: filterProgress,
          filterMALScore: state.malScore,
          filterPersonalScore: state.personalScore,
          filterStatusCheck: state.statusCheck
        });
        if (!result.success) throw new Error(result.error);
        return {
          data: result.data.data.map((item) => ({
            ...item,
            mediaType: "manga" as const
          })),
          metadata: result.data.metadata
        };
      }

      const result = await lightNovelService.list({
        page,
        limit: PAGE_SIZE,
        query: state.query,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
        filterAuthor: state.author,
        filterGenre: state.genre,
        filterTheme: state.theme,
        filterProgressStatus: filterProgress,
        filterMALScore: state.malScore,
        filterPersonalScore: state.personalScore,
        filterStatusCheck: state.statusCheck
      });
      if (!result.success) throw new Error(result.error);
      return {
        data: result.data.data.map((item) => ({
          ...item,
          mediaType: "lightNovel" as const
        })),
        metadata: result.data.metadata
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, pageCount } = lastPage.metadata;
      return page < pageCount ? page + 1 : undefined;
    }
  });
};
