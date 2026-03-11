import { ApiResponse } from "@/types/api.type";
import {
  AllTimeStatistic,
  AuthorConsumption,
  GenreConsumption,
  MediaConsumption,
  MediaProgress,
  StudioConsumption,
  ThemeConsumption
} from "@/types/statistic.type";

import interceptedAxios, { handleAxiosError } from "@/lib/axios";
import { STATISTICS_VIEW } from "@/lib/enums";

const BASE_STATISTIC_URL = "/api/statistic";

const createStatisticService = () => {
  const fetchYearRange = async () => {
    try {
      const response = await interceptedAxios.get<ApiResponse<number[]>>(
        `${BASE_STATISTIC_URL}/year-range`
      );
      return response.data.data;
    } catch (error) {
      const message = handleAxiosError(error);
      throw new Error(message);
    }
  };

  const fetchMediaConsumption = async (
    view: STATISTICS_VIEW,
    year?: string
  ) => {
    try {
      let yearParams: string | undefined;
      if (view === STATISTICS_VIEW.MONTHLY) {
        yearParams = year;
      }
      const response = await interceptedAxios.get<
        ApiResponse<MediaConsumption[]>
      >(`${BASE_STATISTIC_URL}/media-consumption`, {
        params: { view: view.toLowerCase(), year: yearParams }
      });
      return response.data.data;
    } catch (error) {
      const message = handleAxiosError(error);
      throw new Error(message);
    }
  };

  const fetchMediaProgress = async (
    media: "anime" | "manga" | "lightNovel"
  ) => {
    try {
      const response = await interceptedAxios.get<ApiResponse<MediaProgress[]>>(
        `${BASE_STATISTIC_URL}/media-progress`,
        { params: { media } }
      );
      return response.data.data;
    } catch (error) {
      const message = handleAxiosError(error);
      throw new Error(message);
    }
  };

  const fetchGenreConsumption = async () => {
    try {
      const response = await interceptedAxios.get<
        ApiResponse<GenreConsumption[]>
      >(`${BASE_STATISTIC_URL}/genre-consumption`);
      return response.data.data;
    } catch (error) {
      const message = handleAxiosError(error);
      throw new Error(message);
    }
  };

  const fetchStudioConsumption = async () => {
    try {
      const response = await interceptedAxios.get<
        ApiResponse<StudioConsumption[]>
      >(`${BASE_STATISTIC_URL}/studio-consumption`);
      return response.data.data;
    } catch (error) {
      const message = handleAxiosError(error);
      throw new Error(message);
    }
  };

  const fetchThemeConsumption = async () => {
    try {
      const response = await interceptedAxios.get<
        ApiResponse<ThemeConsumption[]>
      >(`${BASE_STATISTIC_URL}/theme-consumption`);
      return response.data.data;
    } catch (error) {
      const message = handleAxiosError(error);
      throw new Error(message);
    }
  };

  const fetchAuthorConsumption = async () => {
    try {
      const response = await interceptedAxios.get<
        ApiResponse<AuthorConsumption[]>
      >(`${BASE_STATISTIC_URL}/author-consumption`);
      return response.data.data;
    } catch (error) {
      const message = handleAxiosError(error);
      throw new Error(message);
    }
  };

  const fetchAllTimeStatistic = async () => {
    try {
      const response = await interceptedAxios.get<
        ApiResponse<AllTimeStatistic>
      >(`${BASE_STATISTIC_URL}/all-time`);
      return response.data.data;
    } catch (error) {
      const message = handleAxiosError(error);
      throw new Error(message);
    }
  };

  return {
    fetchYearRange,
    fetchMediaConsumption,
    fetchMediaProgress,
    fetchGenreConsumption,
    fetchStudioConsumption,
    fetchThemeConsumption,
    fetchAuthorConsumption,
    fetchAllTimeStatistic
  };
};

const statisticService = createStatisticService();

export { statisticService };
