"use client";

import { useMemo, useState } from "react";

import { mangaService } from "@/services/manga.service";

import { useQueryErrorToast } from "@/hooks/useQueryErrorToast";

import { ratingDescriptions } from "@/lib/constants";

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

  const reviewObject = mangaDetail?.review;

  const mangaPersonalRatings = useMemo(() => {
    if (!reviewObject) {
      return [];
    }
    return [
      {
        title: "Storyline",
        weight: "30",
        rating: reviewObject.storylineRating
          ? `${reviewObject.storylineRating} - ${
              ratingDescriptions[reviewObject.storylineRating]
            }`
          : "N/A"
      },
      {
        title: "Art Style",
        weight: "25",
        rating: reviewObject.artStyleRating
          ? `${reviewObject.artStyleRating} - ${
              ratingDescriptions[reviewObject.artStyleRating]
            }`
          : "N/A"
      },
      {
        title: "Character Development",
        weight: "20",
        rating: reviewObject.charDevelopmentRating
          ? `${reviewObject.charDevelopmentRating} - ${
              ratingDescriptions[reviewObject.charDevelopmentRating]
            }`
          : "N/A"
      },
      {
        title: "World Building",
        weight: "15",
        rating: reviewObject.worldBuildingRating
          ? `${reviewObject.worldBuildingRating} - ${
              ratingDescriptions[reviewObject.worldBuildingRating]
            }`
          : "N/A"
      },
      {
        title: "Originality",
        weight: "10",
        rating: reviewObject.originalityRating
          ? `${reviewObject.originalityRating} - ${
              ratingDescriptions[reviewObject.originalityRating]
            }`
          : "N/A"
      }
    ];
  }, [reviewObject]);

  const handleRevealSpoilers = () => setShowSpoilerWarning(true);

  return {
    mangaDetail,
    error,
    ...queryRest,
    mangaPersonalRatings,
    showSpoilerWarning,
    setShowSpoilerWarning,
    spoilersRevealed,
    setSpoilersRevealed,
    handleRevealSpoilers
  };
};
