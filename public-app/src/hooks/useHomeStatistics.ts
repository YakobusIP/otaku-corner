"use client";

import { statisticService, HOME_TASTE_PROFILE_LIMIT } from "@/services/statistic.service";

import { useQueryErrorToast } from "@/hooks/useQueryErrorToast";

import { useQueries } from "@tanstack/react-query";

export const useHomeStatistics = () => {
  const [allTimeStats, tasteProfile, recentReviews] = useQueries({
    queries: [
      {
        queryKey: ["allTimeStats"],
        queryFn: () => statisticService.fetchAllTime()
      },
      {
        queryKey: ["tasteProfile", HOME_TASTE_PROFILE_LIMIT],
        queryFn: () =>
          statisticService.fetchTasteProfile(HOME_TASTE_PROFILE_LIMIT)
      },
      {
        queryKey: ["recentReviews", 4],
        queryFn: () => statisticService.fetchRecentReviews(4)
      }
    ]
  });

  useQueryErrorToast(allTimeStats.error);
  useQueryErrorToast(tasteProfile.error);
  useQueryErrorToast(recentReviews.error);

  return {
    allTimeStatsQuery: allTimeStats,
    tasteProfileQuery: tasteProfile,
    recentReviewsQuery: recentReviews
  };
};
