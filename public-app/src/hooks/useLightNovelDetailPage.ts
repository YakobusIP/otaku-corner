"use client";

import { lightNovelService } from "@/services/lightnovel.service";

import { useMediaDetailSpoilerState } from "@/hooks/useMediaDetailSpoilerState";
import { useQueryErrorToast } from "@/hooks/useQueryErrorToast";

import { useQuery } from "@tanstack/react-query";

export const useLightNovelDetailPage = (id: number) => {
  const spoilerState = useMediaDetailSpoilerState();

  const {
    data: lightNovelDetail,
    error,
    ...queryRest
  } = useQuery({
    queryKey: ["lightNovel", id],
    queryFn: () => lightNovelService.fetchById(id)
  });

  useQueryErrorToast(error);

  return {
    lightNovelDetail,
    error,
    ...queryRest,
    ...spoilerState
  };
};
