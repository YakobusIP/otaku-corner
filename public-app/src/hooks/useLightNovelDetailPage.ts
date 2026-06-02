"use client";

import { useState } from "react";

import { lightNovelService } from "@/services/lightnovel.service";

import { useQueryErrorToast } from "@/hooks/useQueryErrorToast";

import { useQuery } from "@tanstack/react-query";

export const useLightNovelDetailPage = (id: number) => {
  const [showSpoilerWarning, setShowSpoilerWarning] = useState(false);
  const [spoilersRevealed, setSpoilersRevealed] = useState(false);

  const {
    data: lightNovelDetail,
    error,
    ...queryRest
  } = useQuery({
    queryKey: ["lightNovel", id],
    queryFn: () => lightNovelService.fetchById(id)
  });

  useQueryErrorToast(error);

  const handleRevealSpoilers = () => setShowSpoilerWarning(true);

  return {
    lightNovelDetail,
    error,
    ...queryRest,
    showSpoilerWarning,
    setShowSpoilerWarning,
    spoilersRevealed,
    setSpoilersRevealed,
    handleRevealSpoilers
  };
};
