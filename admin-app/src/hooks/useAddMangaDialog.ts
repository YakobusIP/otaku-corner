import { Dispatch, SetStateAction } from "react";

import { mangaService } from "@/services/manga.service";

import { useJikanSelection } from "@/hooks/useJikanSelection";

import type { MangaCreateRequest } from "@/types/manga.type";

import { mangaToCreateRequest } from "@/lib/media-dialog-helpers";

import { Manga, MangaClient } from "@tutkli/jikan-ts";

const mangaClient = new MangaClient();

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
  return useJikanSelection<Manga, MangaCreateRequest>({
    openDialog,
    setOpenDialog,
    resetParent,
    config: {
      searchKeyPrefix: "jikan-manga-search",
      searchFn: async (query, page) => {
        const response = await mangaClient.getMangaSearch({
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
