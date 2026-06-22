import { Dispatch, SetStateAction } from "react";

import { animeService } from "@/services/anime.service";

import { useJikanSelection } from "@/hooks/useJikanSelection";

import type { AnimeCreateRequest } from "@/types/anime.type";

import { animeJikanClient } from "@/lib/jikan-clients";
import { animeToCreateRequest } from "@/lib/media-dialog-helpers";

import { Anime } from "@tutkli/jikan-ts";

export type UseAddAnimeDialogArgs = {
  openDialog: boolean;
  setOpenDialog: Dispatch<SetStateAction<boolean>>;
  resetParent: () => Promise<void>;
};

export function useAddAnimeDialog({
  openDialog,
  setOpenDialog,
  resetParent
}: UseAddAnimeDialogArgs) {
  return useJikanSelection<Anime, AnimeCreateRequest>({
    openDialog,
    setOpenDialog,
    resetParent,
    config: {
      searchKeyPrefix: "jikan-anime-search",
      searchFn: async (query, page) => {
        const response = await animeJikanClient.getAnimeSearch({
          q: query,
          limit: 10,
          page
        });
        return {
          results: response.data,
          pagination: response.pagination
        };
      },
      createFn: (data) => animeService.create(data),
      toCreateRequest: animeToCreateRequest,
      duplicateCheckFn: (malId) => animeService.getDuplicates(malId),
      mediaTypeKey: "anime",
      mediaLabel: "anime"
    }
  });
}
