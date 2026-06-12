"use client";

import {
  HOME_RECENT_REVIEWS_LIMIT,
  HOME_TASTE_PROFILE_LIMIT,
  statisticService
} from "@/services/statistic.service";

import { useQueryErrorToast } from "@/hooks/useQueryErrorToast";

import { useQueries, useQuery } from "@tanstack/react-query";

export const useHomeAllTimeStats = () => {
  const query = useQuery({
    queryKey: ["allTimeStats"],
    queryFn: () => statisticService.fetchAllTime()
  });

  useQueryErrorToast(query.error);

  return { allTimeStatsQuery: query };
};

export const useHomeInsightsStatistics = () => {
  const [tasteProfile, recentReviews] = useQueries({
    queries: [
      {
        queryKey: ["tasteProfile", HOME_TASTE_PROFILE_LIMIT],
        queryFn: () =>
          statisticService.fetchTasteProfile(HOME_TASTE_PROFILE_LIMIT)
      },
      {
        queryKey: ["recentReviews", HOME_RECENT_REVIEWS_LIMIT],
        queryFn: () =>
          statisticService.fetchRecentReviews(HOME_RECENT_REVIEWS_LIMIT)
      }
    ]
  });

  useQueryErrorToast(tasteProfile.error);
  useQueryErrorToast(recentReviews.error);

  return {
    tasteProfileQuery: tasteProfile,
    recentReviewsQuery: recentReviews
  };
};
