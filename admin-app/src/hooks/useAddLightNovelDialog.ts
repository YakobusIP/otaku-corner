import { Dispatch, SetStateAction } from "react";

import { lightNovelService } from "@/services/light-novel.service";

import { useJikanSelection } from "@/hooks/useJikanSelection";

import type { LightNovelCreateRequest } from "@/types/light-novel.type";

import { mangaJikanClient } from "@/lib/jikan-clients";
import { lightNovelToCreateRequest } from "@/lib/media-dialog-helpers";

import { Manga } from "@tutkli/jikan-ts";

export type UseAddLightNovelDialogArgs = {
  openDialog: boolean;
  setOpenDialog: Dispatch<SetStateAction<boolean>>;
  resetParent: () => Promise<void>;
};

export function useAddLightNovelDialog({
  openDialog,
  setOpenDialog,
  resetParent
}: UseAddLightNovelDialogArgs) {
  return useJikanSelection<Manga, LightNovelCreateRequest>({
    openDialog,
    setOpenDialog,
    resetParent,
    config: {
      searchKeyPrefix: "jikan-lightnovel-search",
      searchFn: async (query, page) => {
        const response = await mangaJikanClient.getMangaSearch({
          q: query,
          limit: 10,
          page,
          type: "Lightnovel"
        });
        return {
          results: response.data,
          pagination: response.pagination
        };
      },
      createFn: (data) => lightNovelService.create(data),
      toCreateRequest: lightNovelToCreateRequest,
      duplicateCheckFn: (malId) => lightNovelService.getDuplicates(malId),
      mediaTypeKey: "lightNovel",
      mediaLabel: "light novel"
    }
  });
}
