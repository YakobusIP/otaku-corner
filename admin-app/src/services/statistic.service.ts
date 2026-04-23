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
type ServiceResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

const createStatisticService = () => {
  const fetchYearRange = async () => {
    try {
      const response = await interceptedAxios.get<number[]>(
        `${BASE_STATISTIC_URL}/year-range`
      );
      return response.data;
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
      const response = await interceptedAxios.get<MediaConsumption[]>(
        `${BASE_STATISTIC_URL}/media-consumption`,
        {
          params: { view: view.toLowerCase(), year: yearParams }
        }
      );
      return response.data;
    } catch (error) {
      const message = handleAxiosError(error);
      throw new Error(message);
    }
  };

  const fetchMediaProgress = async (
    media: "anime" | "manga" | "lightNovel"
  ) => {
    try {
      const response = await interceptedAxios.get<MediaProgress[]>(
        `${BASE_STATISTIC_URL}/media-progress`,
        { params: { media } }
      );
      return response.data;
    } catch (error) {
      const message = handleAxiosError(error);
      throw new Error(message);
    }
  };

  const fetchGenreConsumption = async () => {
    try {
      const response = await interceptedAxios.get<GenreConsumption[]>(
        `${BASE_STATISTIC_URL}/genre-consumption`
      );
      return response.data;
    } catch (error) {
      const message = handleAxiosError(error);
      throw new Error(message);
    }
  };

  const fetchStudioConsumption = async () => {
    try {
      const response = await interceptedAxios.get<StudioConsumption[]>(
        `${BASE_STATISTIC_URL}/studio-consumption`
      );
      return response.data;
    } catch (error) {
      const message = handleAxiosError(error);
      throw new Error(message);
    }
  };

  const fetchThemeConsumption = async () => {
    try {
      const response = await interceptedAxios.get<ThemeConsumption[]>(
        `${BASE_STATISTIC_URL}/theme-consumption`
      );
      return response.data;
    } catch (error) {
      const message = handleAxiosError(error);
      throw new Error(message);
    }
  };

  const fetchAuthorConsumption = async () => {
    try {
      const response = await interceptedAxios.get<AuthorConsumption[]>(
        `${BASE_STATISTIC_URL}/author-consumption`
      );
      return response.data;
    } catch (error) {
      const message = handleAxiosError(error);
      throw new Error(message);
    }
  };

  const fetchAllTimeStatistic = async () => {
    try {
      const response = await interceptedAxios.get<AllTimeStatistic>(
        `${BASE_STATISTIC_URL}/all-time`
      );
      return response.data;
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

const safeCall = async <T>(fn: () => Promise<T>): Promise<ServiceResult<T>> => {
  try {
    return { success: true, data: await fn() };
  } catch (error) {
    return { success: false, error: handleAxiosError(error) };
  }
};

const fetchYearRangeService = async () =>
  safeCall(statisticService.fetchYearRange);
const fetchMediaConsumptionService = async (
  view: STATISTICS_VIEW,
  year?: string
) => safeCall(() => statisticService.fetchMediaConsumption(view, year));
const fetchMediaProgressService = async (
  media: "anime" | "manga" | "lightNovel"
) => safeCall(() => statisticService.fetchMediaProgress(media));
const fetchGenreConsumptionService = async () =>
  safeCall(statisticService.fetchGenreConsumption);
const fetchStudioConsumptionService = async () =>
  safeCall(statisticService.fetchStudioConsumption);
const fetchThemeConsumptionService = async () =>
  safeCall(statisticService.fetchThemeConsumption);
const fetchAuthorConsumptionService = async () =>
  safeCall(statisticService.fetchAuthorConsumption);
const fetchAllTimeStatisticService = async () =>
  safeCall(statisticService.fetchAllTimeStatistic);

export {
  statisticService,
  fetchYearRangeService,
  fetchMediaConsumptionService,
  fetchMediaProgressService,
  fetchGenreConsumptionService,
  fetchStudioConsumptionService,
  fetchThemeConsumptionService,
  fetchAuthorConsumptionService,
  fetchAllTimeStatisticService
};
