import { statisticService } from "@/services/statistic.service";

import type { MediaConsumption } from "@/types/statistic.type";

import { STATISTICS_VIEW } from "@/lib/enums";
import { statisticKeys } from "@/lib/query-keys";

import { useQuery } from "@tanstack/react-query";

export type DashboardYearScope = number | "all";

type UseDashboardQueriesOptions = {
  tasteProfileLimit?: number;
  recentReviewsLimit?: number;
};

export const useDashboardQueries = (
  yearScope: DashboardYearScope,
  options: UseDashboardQueriesOptions = {}
) => {
  const tasteProfileLimit = options.tasteProfileLimit ?? 10;
  const recentReviewsLimit = options.recentReviewsLimit ?? 5;

  const consumptionYear = yearScope === "all" ? "all" : String(yearScope);
  const effectiveConsumptionView =
    yearScope === "all" ? STATISTICS_VIEW.YEARLY : STATISTICS_VIEW.MONTHLY;
  const mediaConsumptionEnabled =
    effectiveConsumptionView === STATISTICS_VIEW.YEARLY ||
    (effectiveConsumptionView === STATISTICS_VIEW.MONTHLY &&
      yearScope !== "all" &&
      consumptionYear.length > 0);

  const yearRangeQuery = useQuery({
    queryKey: statisticKeys.yearRange(),
    queryFn: async () => {
      const result = await statisticService.fetchYearRange();
      if (!result.success) throw new Error(result.error);
      return result.data;
    }
  });

  const kpisQuery = useQuery({
    queryKey: statisticKeys.dashboardKpis(yearScope),
    queryFn: async () => {
      const result = await statisticService.fetchDashboardKpis(yearScope);
      if (!result.success) throw new Error(result.error);
      return result.data;
    }
  });

  const topRatedQuery = useQuery({
    queryKey: statisticKeys.topRatedThisYear(yearScope),
    queryFn: async () => {
      const result = await statisticService.fetchTopRatedThisYear(yearScope);
      if (!result.success) throw new Error(result.error);
      return result.data;
    }
  });

  const libraryHealthQuery = useQuery({
    queryKey: statisticKeys.libraryHealth(),
    queryFn: async () => {
      const result = await statisticService.fetchLibraryHealth();
      if (!result.success) throw new Error(result.error);
      return result.data;
    }
  });

  const tasteProfileQuery = useQuery({
    queryKey: statisticKeys.tasteProfile(tasteProfileLimit),
    queryFn: async () => {
      const result =
        await statisticService.fetchTasteProfile(tasteProfileLimit);
      if (!result.success) throw new Error(result.error);
      return result.data;
    }
  });

  const recentReviewsQuery = useQuery({
    queryKey: statisticKeys.recentReviews(recentReviewsLimit),
    queryFn: async () => {
      const result =
        await statisticService.fetchRecentReviews(recentReviewsLimit);
      if (!result.success) throw new Error(result.error);
      return result.data;
    }
  });

  const mediaConsumptionQuery = useQuery<MediaConsumption[]>({
    queryKey: statisticKeys.mediaConsumption(
      effectiveConsumptionView,
      effectiveConsumptionView === STATISTICS_VIEW.YEARLY
        ? "all-years"
        : consumptionYear
    ),
    queryFn: async () => {
      const response = await statisticService.fetchMediaConsumption(
        effectiveConsumptionView,
        effectiveConsumptionView === STATISTICS_VIEW.MONTHLY
          ? consumptionYear
          : undefined
      );
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    enabled: mediaConsumptionEnabled
  });

  return {
    yearRangeQuery,
    kpisQuery,
    topRatedQuery,
    libraryHealthQuery,
    tasteProfileQuery,
    recentReviewsQuery,
    mediaConsumptionQuery
  };
};
