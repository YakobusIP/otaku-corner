import { Dispatch, SetStateAction } from "react";

import { mangaService } from "@/services/manga.service";

import { useTenraiSelection } from "@/hooks/useTenraiSelection";

import type { MangaCreateRequest } from "@/types/manga.type";

import { mangaTenraiClient } from "@/lib/tenrai-clients";
import { mangaToCreateRequest } from "@/lib/media-dialog-helpers";

import { Manga } from "@tutkli/jikan-ts";

export type UseAddMangaDialogArgs = {
  openDialog: boolean;
  setOpenDialog: Dispatch<SetStateAction<boolean>>;
  resetParent: () => Promise<void>;
};

export function useAddMangaDialog({
  openDialog,
  setOpenDialog,
  resetParent
}: UseAddMangaDialogArgs) {
  return useTenraiSelection<Manga, MangaCreateRequest>({
    openDialog,
    setOpenDialog,
    resetParent,
    config: {
      searchKeyPrefix: "tenrai-manga-search",
      searchFn: async (query, page) => {
        const response = await mangaTenraiClient.getMangaSearch({
          q: query,
          limit: 10,
          page,
          type: "Manga"
        });
        return {
          results: response.data,
          pagination: response.pagination
        };
      },
      createFn: (data) => mangaService.create(data),
      toCreateRequest: mangaToCreateRequest,
      duplicateCheckFn: (malId) => mangaService.getDuplicates(malId),
      mediaTypeKey: "manga",
      mediaLabel: "manga"
    }
  });
}
