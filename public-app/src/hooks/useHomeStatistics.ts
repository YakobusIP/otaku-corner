"use client";

import { statisticService } from "@/services/statistic.service";

import { useQueryErrorToast } from "@/hooks/useQueryErrorToast";

import { useQueries } from "@tanstack/react-query";

export const useHomeStatistics = () => {
  const [allTimeStats, topMedias] = useQueries({
    queries: [
      {
        queryKey: ["allTimeStats"],
        queryFn: () => statisticService.fetchAllTime()
      },
      {
        queryKey: ["topMedias"],
        queryFn: () => statisticService.fetchTopMediaAndYearlyCount()
      }
    ]
  });

  useQueryErrorToast(allTimeStats.error);
  useQueryErrorToast(topMedias.error);

  return { allTimeStatsQuery: allTimeStats, topMediasQuery: topMedias };
};
