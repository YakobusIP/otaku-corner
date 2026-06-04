"use client";

import { mangaService } from "@/services/manga.service";

import { useMediaDetailSpoilerState } from "@/hooks/useMediaDetailSpoilerState";
import { useQueryErrorToast } from "@/hooks/useQueryErrorToast";

import { useQuery } from "@tanstack/react-query";

export const useMangaDetailPage = (id: number) => {
  const spoilerState = useMediaDetailSpoilerState();

  const {
    data: mangaDetail,
    error,
    ...queryRest
  } = useQuery({
    queryKey: ["manga", id],
    queryFn: () => mangaService.fetchById(id)
  });

  useQueryErrorToast(error);

  return {
    mangaDetail,
    error,
    ...queryRest,
    ...spoilerState
  };
};
