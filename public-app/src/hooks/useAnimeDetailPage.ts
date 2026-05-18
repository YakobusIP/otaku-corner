"use client";

import { useMemo, useState } from "react";

import { animeService } from "@/services/anime.service";

import { useQueryErrorToast } from "@/hooks/useQueryErrorToast";

import { ratingDescriptions } from "@/lib/constants";

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

  const reviewObject = animeDetail?.review;

  const embedURL = useMemo(
    () => animeDetail?.trailer?.replace(/(autoplay=)[^&]+/, "autoplay=0"),
    [animeDetail]
  );

  const animePersonalRatings = useMemo(() => {
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
        title: "Animation Quality",
        weight: "25",
        rating: reviewObject.qualityRating
          ? `${reviewObject.qualityRating} - ${
              ratingDescriptions[reviewObject.qualityRating]
            }`
          : "N/A"
      },
      {
        title: "Voice Acting",
        weight: "20",
        rating: reviewObject.voiceActingRating
          ? `${reviewObject.voiceActingRating} - ${
              ratingDescriptions[reviewObject.voiceActingRating]
            }`
          : "N/A"
      },
      {
        title: "Soundtrack",
        weight: "15",
        rating: reviewObject.soundTrackRating
          ? `${reviewObject.soundTrackRating} - ${
              ratingDescriptions[reviewObject.soundTrackRating]
            }`
          : "N/A"
      },
      {
        title: "Character Development",
        weight: "10",
        rating: reviewObject.charDevelopmentRating
          ? `${reviewObject.charDevelopmentRating} - ${
              ratingDescriptions[reviewObject.charDevelopmentRating]
            }`
          : "N/A"
      }
    ];
  }, [reviewObject]);

  const handleRevealSpoilers = () => setShowSpoilerWarning(true);

  return {
    animeDetail,
    error,
    ...queryRest,
    embedURL,
    animePersonalRatings,
    showSpoilerWarning,
    setShowSpoilerWarning,
    spoilersRevealed,
    setSpoilersRevealed,
    handleRevealSpoilers
  };
};
