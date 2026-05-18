"use client";

import { statisticService, HOME_TASTE_PROFILE_LIMIT } from "@/services/statistic.service";

import { useQueryErrorToast } from "@/hooks/useQueryErrorToast";

import { useQueries } from "@tanstack/react-query";

const currentYear = () => new Date().getFullYear();

export const useHomeStatistics = () => {
  const year = currentYear();

  const [
    allTimeStats,
    topMedias,
    mediaConsumption,
    tasteProfile,
    recentReviews
  ] = useQueries({
    queries: [
      {
        queryKey: ["allTimeStats"],
        queryFn: () => statisticService.fetchAllTime()
      },
      {
        queryKey: ["topMedias"],
        queryFn: () => statisticService.fetchTopMediaAndYearlyCount()
      },
      {
        queryKey: ["mediaConsumption", "monthly", year],
        queryFn: () =>
          statisticService.fetchMediaConsumption("monthly", String(year))
      },
      {
        queryKey: ["tasteProfile", HOME_TASTE_PROFILE_LIMIT],
        queryFn: () =>
          statisticService.fetchTasteProfile(HOME_TASTE_PROFILE_LIMIT)
      },
      {
        queryKey: ["recentReviews", 5],
        queryFn: () => statisticService.fetchRecentReviews(5)
      }
    ]
  });

  useQueryErrorToast(allTimeStats.error);
  useQueryErrorToast(topMedias.error);
  useQueryErrorToast(mediaConsumption.error);
  useQueryErrorToast(tasteProfile.error);
  useQueryErrorToast(recentReviews.error);

  return {
    allTimeStatsQuery: allTimeStats,
    topMediasQuery: topMedias,
    mediaConsumptionQuery: mediaConsumption,
    tasteProfileQuery: tasteProfile,
    recentReviewsQuery: recentReviews
  };
};
