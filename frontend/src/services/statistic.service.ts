import interceptedAxios from "@/lib/axios";
import { ApiResponse } from "@/types/api.type";
import { AxiosError } from "axios";
import {
  AllTimeStatistic,
  AuthorConsumption,
  GenreConsumption,
  MediaConsumption,
  MediaProgress,
  StudioConsumption,
  ThemeConsumption
} from "@/types/statistic.type";
import { STATISTICS_VIEW } from "@/lib/enums";

const BASE_STATISTIC_URL = "/api/statistic";

const fetchYearRangeService = async (): Promise<ApiResponse<number[]>> => {
  try {
    const response = await interceptedAxios.get(
      `${BASE_STATISTIC_URL}/year-range`
    );
    return { success: true, data: response.data.data };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof AxiosError && error.response?.data.error
          ? error.response?.data.error
          : "There was a problem with your request."
    };
  }
};

const fetchMediaConsumptionService = async (
  view: STATISTICS_VIEW,
  year?: string
): Promise<ApiResponse<MediaConsumption[]>> => {
  try {
    let yearParams: string | undefined;
    if (view === STATISTICS_VIEW.MONTHLY) {
      yearParams = year;
    }
    const response = await interceptedAxios.get(
      `${BASE_STATISTIC_URL}/media-consumption`,
      { params: { view: view.toLowerCase(), year: yearParams } }
    );
    return { success: true, data: response.data.data };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof AxiosError && error.response?.data.error
          ? error.response?.data.error
          : "There was a problem with your request."
    };
  }
};

const fetchMediaProgressService = async (
  media: "anime" | "manga" | "lightNovel"
): Promise<ApiResponse<MediaProgress[]>> => {
  try {
    const response = await interceptedAxios.get(
      `${BASE_STATISTIC_URL}/media-progress`,
      { params: { media } }
    );
    return { success: true, data: response.data.data };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof AxiosError && error.response?.data.error
          ? error.response?.data.error
          : "There was a problem with your request."
    };
  }
};

const fetchGenreConsumptionService = async (): Promise<
  ApiResponse<GenreConsumption[]>
> => {
  try {
    const response = await interceptedAxios.get(
      `${BASE_STATISTIC_URL}/genre-consumption`
    );
    return { success: true, data: response.data.data };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof AxiosError && error.response?.data.error
          ? error.response?.data.error
          : "There was a problem with your request."
    };
  }
};

const fetchStudioConsumptionService = async (): Promise<
  ApiResponse<StudioConsumption[]>
> => {
  try {
    const response = await interceptedAxios.get(
      `${BASE_STATISTIC_URL}/studio-consumption`
    );
    return { success: true, data: response.data.data };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof AxiosError && error.response?.data.error
          ? error.response?.data.error
          : "There was a problem with your request."
    };
  }
};

const fetchThemeConsumptionService = async (): Promise<
  ApiResponse<ThemeConsumption[]>
> => {
  try {
    const response = await interceptedAxios.get(
      `${BASE_STATISTIC_URL}/theme-consumption`
    );
    return { success: true, data: response.data.data };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof AxiosError && error.response?.data.error
          ? error.response?.data.error
          : "There was a problem with your request."
    };
  }
};

const fetchAuthorConsumptionService = async (): Promise<
  ApiResponse<AuthorConsumption[]>
> => {
  try {
    const response = await interceptedAxios.get(
      `${BASE_STATISTIC_URL}/author-consumption`
    );
    return { success: true, data: response.data.data };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof AxiosError && error.response?.data.error
          ? error.response?.data.error
          : "There was a problem with your request."
    };
  }
};

const fetchAllTimeStatisticService = async (): Promise<
  ApiResponse<AllTimeStatistic>
> => {
  try {
    const response = await interceptedAxios.get(
      `${BASE_STATISTIC_URL}/all-time`
    );
    return { success: true, data: response.data.data };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof AxiosError && error.response?.data.error
          ? error.response?.data.error
          : "There was a problem with your request."
    };
  }
};

export {
  fetchYearRangeService,
  fetchMediaConsumptionService,
  fetchMediaProgressService,
  fetchGenreConsumptionService,
  fetchStudioConsumptionService,
  fetchThemeConsumptionService,
  fetchAuthorConsumptionService,
  fetchAllTimeStatisticService
};
