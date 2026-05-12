import type { ServiceResult } from "@/types/general.type";
import {
  DashboardKpis,
  LibraryHealth,
  MediaConsumption,
  RecentReviewItem,
  TasteProfile,
  TopRatedThisYear
} from "@/types/statistic.type";

import interceptedAxios from "@/lib/axios";
import { STATISTICS_VIEW } from "@/lib/enums";
import { err, ok } from "@/lib/service-result";

const BASE_STATISTIC_URL = "/api/statistic";

const createStatisticService = () => {
  const fetchYearRange = async (): Promise<ServiceResult<number[]>> => {
    try {
      const response = await interceptedAxios.get<number[]>(
        `${BASE_STATISTIC_URL}/year-range`
      );
      return ok(response.data);
    } catch (error) {
      return err(error);
    }
  };

  const fetchMediaConsumption = async (
    view: STATISTICS_VIEW,
    year?: string
  ): Promise<ServiceResult<MediaConsumption[]>> => {
    try {
      let yearParams: string | undefined;
      if (view === STATISTICS_VIEW.MONTHLY) {
        yearParams = year;
      }
      const response = await interceptedAxios.get<MediaConsumption[]>(
        `${BASE_STATISTIC_URL}/media-consumption`,
        {
          params: { view: view.toLowerCase(), year: yearParams }
        }
      );
      return ok(response.data);
    } catch (error) {
      return err(error);
    }
  };

  const fetchDashboardKpis = async (
    yearScope: number | "all"
  ): Promise<ServiceResult<DashboardKpis>> => {
    try {
      const params =
        yearScope === "all" ? { allTime: true } : { year: yearScope };
      const response = await interceptedAxios.get<DashboardKpis>(
        `${BASE_STATISTIC_URL}/dashboard-kpis`,
        { params }
      );
      return ok(response.data);
    } catch (error) {
      return err(error);
    }
  };

  const fetchTopRatedThisYear = async (
    yearScope: number | "all"
  ): Promise<ServiceResult<TopRatedThisYear>> => {
    try {
      const params =
        yearScope === "all" ? { allTime: true } : { year: yearScope };
      const response = await interceptedAxios.get<TopRatedThisYear>(
        `${BASE_STATISTIC_URL}/top-rated`,
        { params }
      );
      return ok(response.data);
    } catch (error) {
      return err(error);
    }
  };

  const fetchLibraryHealth = async (): Promise<
    ServiceResult<LibraryHealth>
  > => {
    try {
      const response = await interceptedAxios.get<LibraryHealth>(
        `${BASE_STATISTIC_URL}/library-health`
      );
      return ok(response.data);
    } catch (error) {
      return err(error);
    }
  };

  const fetchRecentReviews = async (
    limit = 10
  ): Promise<ServiceResult<RecentReviewItem[]>> => {
    try {
      const response = await interceptedAxios.get<RecentReviewItem[]>(
        `${BASE_STATISTIC_URL}/recent-reviews`,
        { params: { limit } }
      );
      return ok(response.data);
    } catch (error) {
      return err(error);
    }
  };

  const fetchTasteProfile = async (
    limit = 10
  ): Promise<ServiceResult<TasteProfile>> => {
    try {
      const response = await interceptedAxios.get<TasteProfile>(
        `${BASE_STATISTIC_URL}/taste-profile`,
        { params: { limit } }
      );
      return ok(response.data);
    } catch (error) {
      return err(error);
    }
  };

  return {
    fetchYearRange,
    fetchMediaConsumption,
    fetchDashboardKpis,
    fetchTopRatedThisYear,
    fetchLibraryHealth,
    fetchRecentReviews,
    fetchTasteProfile
  };
};

export const statisticService = createStatisticService();
