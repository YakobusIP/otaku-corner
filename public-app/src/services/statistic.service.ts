import type { ApiResponse } from "@/types/api.type";
import type {
  AllTimeCount,
  MediaConsumptionRow,
  RecentReviewItem,
  TasteProfile,
  TopMediaAndYearlyCount
} from "@/types/statistic.type";

import { axiosClient, handleAxiosError } from "@/lib/axios";

import type { AxiosResponse } from "axios";

const BASE_STATISTIC_URL = "/api/statistic";

export const HOME_TASTE_PROFILE_LIMIT = 5;
export const HOME_RECENT_REVIEWS_LIMIT = 4;

const unwrap = <T>(response: AxiosResponse<unknown>): T => {
  const body = response.data as ApiResponse<T> | T;
  if (
    body &&
    typeof body === "object" &&
    "data" in body &&
    (body as ApiResponse<T>).data !== undefined
  ) {
    return (body as ApiResponse<T>).data;
  }
  return body as T;
};

const createStatisticService = () => {
  const fetchYearRange = async () => {
    try {
      const response = await axiosClient.get(
        `${BASE_STATISTIC_URL}/year-range`
      );
      return unwrap<number[]>(response);
    } catch (error) {
      throw new Error(handleAxiosError(error));
    }
  };

  const fetchAllTime = async () => {
    try {
      const response = await axiosClient.get(
        `${BASE_STATISTIC_URL}/all-time`
      );
      return unwrap<AllTimeCount>(response);
    } catch (error) {
      throw new Error(handleAxiosError(error));
    }
  };

  const fetchTopMediaAndYearlyCount = async (year?: number) => {
    try {
      const response = await axiosClient.get(
        `${BASE_STATISTIC_URL}/top-media-and-yearly-count`,
        {
          params:
            year !== undefined && year !== null ? { year } : {}
        }
      );
      return unwrap<TopMediaAndYearlyCount>(response);
    } catch (error) {
      throw new Error(handleAxiosError(error));
    }
  };

  const fetchMediaConsumption = async (
    view: "monthly" | "yearly",
    year?: string
  ) => {
    try {
      const response = await axiosClient.get(
        `${BASE_STATISTIC_URL}/media-consumption`,
        {
          params: {
            view,
            ...(year !== undefined ? { year } : {})
          }
        }
      );
      return unwrap<MediaConsumptionRow[]>(response);
    } catch (error) {
      throw new Error(handleAxiosError(error));
    }
  };

  const fetchTasteProfile = async (limit: number) => {
    try {
      const response = await axiosClient.get(
        `${BASE_STATISTIC_URL}/taste-profile`,
        { params: { limit } }
      );
      return unwrap<TasteProfile>(response);
    } catch (error) {
      throw new Error(handleAxiosError(error));
    }
  };

  const fetchRecentReviews = async (limit: number) => {
    try {
      const response = await axiosClient.get(
        `${BASE_STATISTIC_URL}/recent-reviews`,
        { params: { limit } }
      );
      return unwrap<RecentReviewItem[]>(response);
    } catch (error) {
      throw new Error(handleAxiosError(error));
    }
  };

  return {
    fetchYearRange,
    fetchAllTime,
    fetchTopMediaAndYearlyCount,
    fetchMediaConsumption,
    fetchTasteProfile,
    fetchRecentReviews
  };
};

export const statisticService = createStatisticService();
