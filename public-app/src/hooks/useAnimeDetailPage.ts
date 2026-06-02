"use client";

import { useMemo } from "react";

import { animeService } from "@/services/anime.service";

import { useMediaDetailSpoilerState } from "@/hooks/useMediaDetailSpoilerState";
import { useQueryErrorToast } from "@/hooks/useQueryErrorToast";

import { useQuery } from "@tanstack/react-query";

export const useAnimeDetailPage = (id: number) => {
  const spoilerState = useMediaDetailSpoilerState();

  const {
    data: animeDetail,
    error,
    ...queryRest
  } = useQuery({
    queryKey: ["anime", id],
    queryFn: () => animeService.fetchById(id)
  });

  useQueryErrorToast(error);

  const embedURL = useMemo(
    () => animeDetail?.trailer?.replace(/(autoplay=)[^&]+/, "autoplay=0"),
    [animeDetail]
  );

  return {
    animeDetail,
    error,
    ...queryRest,
    embedURL,
    ...spoilerState
  };
};
