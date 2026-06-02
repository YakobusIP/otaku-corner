"use client";

import { useState } from "react";

import { mangaService } from "@/services/manga.service";

import { useQueryErrorToast } from "@/hooks/useQueryErrorToast";

import { useQuery } from "@tanstack/react-query";

export const useMangaDetailPage = (id: number) => {
  const [showSpoilerWarning, setShowSpoilerWarning] = useState(false);
  const [spoilersRevealed, setSpoilersRevealed] = useState(false);

  const {
    data: mangaDetail,
    error,
    ...queryRest
  } = useQuery({
    queryKey: ["manga", id],
    queryFn: () => mangaService.fetchById(id)
  });

  useQueryErrorToast(error);

  const handleRevealSpoilers = () => setShowSpoilerWarning(true);

  return {
    mangaDetail,
    error,
    ...queryRest,
    showSpoilerWarning,
    setShowSpoilerWarning,
    spoilersRevealed,
    setSpoilersRevealed,
    handleRevealSpoilers
  };
};
