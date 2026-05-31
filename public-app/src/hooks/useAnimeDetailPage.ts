"use client";

import { useMemo, useState } from "react";

import { animeService } from "@/services/anime.service";

import { useQueryErrorToast } from "@/hooks/useQueryErrorToast";

import { useQuery } from "@tanstack/react-query";

export const useAnimeDetailPage = (id: number) => {
  const [showSpoilerWarning, setShowSpoilerWarning] = useState(false);
  const [spoilersRevealed, setSpoilersRevealed] = useState(false);

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

  const handleRevealSpoilers = () => setShowSpoilerWarning(true);

  return {
    animeDetail,
    error,
    ...queryRest,
    embedURL,
    showSpoilerWarning,
    setShowSpoilerWarning,
    spoilersRevealed,
    setSpoilersRevealed,
    handleRevealSpoilers
  };
};
