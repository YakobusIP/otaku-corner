"use client";

import { useMemo, useState } from "react";

import { lightNovelService } from "@/services/lightnovel.service";

import { useQueryErrorToast } from "@/hooks/useQueryErrorToast";

import { ratingDescriptions } from "@/lib/constants";

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

  const reviewObject = lightNovelDetail?.review;

  const lightNovelPersonalRatings = useMemo(() => {
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
        title: "World Building",
        weight: "25",
        rating: reviewObject.worldBuildingRating
          ? `${reviewObject.worldBuildingRating} - ${
              ratingDescriptions[reviewObject.worldBuildingRating]
            }`
          : "N/A"
      },
      {
        title: "Writing Style",
        weight: "20",
        rating: reviewObject.writingStyleRating
          ? `${reviewObject.writingStyleRating} - ${
              ratingDescriptions[reviewObject.writingStyleRating]
            }`
          : "N/A"
      },
      {
        title: "Character Development",
        weight: "15",
        rating: reviewObject.charDevelopmentRating
          ? `${reviewObject.charDevelopmentRating} - ${
              ratingDescriptions[reviewObject.charDevelopmentRating]
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
    lightNovelDetail,
    error,
    ...queryRest,
    lightNovelPersonalRatings,
    showSpoilerWarning,
    setShowSpoilerWarning,
    spoilersRevealed,
    setSpoilersRevealed,
    handleRevealSpoilers
  };
};
