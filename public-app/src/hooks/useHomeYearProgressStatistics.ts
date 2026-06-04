"use client";

import { statisticService } from "@/services/statistic.service";

import { useQueryErrorToast } from "@/hooks/useQueryErrorToast";

import { useQueries } from "@tanstack/react-query";

export const useHomeYearProgressStatistics = (year: number) => {
  const [topMediasQuery, mediaConsumptionQuery, yearRangeQuery] = useQueries({
    queries: [
      {
        queryKey: ["topMedias", year],
        queryFn: () => statisticService.fetchTopMediaAndYearlyCount(year)
      },
      {
        queryKey: ["mediaConsumption", "monthly", year],
        queryFn: () =>
          statisticService.fetchMediaConsumption("monthly", String(year))
      },
      {
        queryKey: ["statisticYearRange"],
        queryFn: () => statisticService.fetchYearRange()
      }
    ]
  });

  useQueryErrorToast(topMediasQuery.error);
  useQueryErrorToast(mediaConsumptionQuery.error);
  useQueryErrorToast(yearRangeQuery.error);

  return { topMediasQuery, mediaConsumptionQuery, yearRangeQuery };
};
