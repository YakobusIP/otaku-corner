import { Dispatch, SetStateAction } from "react";

import { animeService } from "@/services/anime.service";

import { useTenraiSelection } from "@/features/add-media/hooks/useTenraiSelection";

import type { AnimeCreateRequest } from "@/types/anime.type";

import { animeTenraiClient } from "@/features/add-media/lib/tenrai-clients";
import { animeToCreateRequest } from "@/features/add-media/lib/media-dialog-helpers";

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
  return useTenraiSelection<Anime, AnimeCreateRequest>({
    openDialog,
    setOpenDialog,
    resetParent,
    config: {
      searchKeyPrefix: "tenrai-anime-search",
      searchFn: async (query, page) => {
        const response = await animeTenraiClient.getAnimeSearch({
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
