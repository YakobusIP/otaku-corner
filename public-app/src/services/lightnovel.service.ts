import { ApiResponse, ApiResponseList } from "@/types/api.type";
import {
  LightNovelDetail,
  LightNovelList,
  LightNovelSitemap
} from "@/types/lightnovel.type";

import { axiosClient } from "@/lib/axios";
import { PROGRESS_STATUS, SORT_ORDER } from "@/lib/enums";

import { AxiosError } from "axios";

const BASE_LIGHTNOVEL_URL = "/api/light-novel";

const fetchAllLightNovelService = async (
  currentPage: number,
  limitPerPage: number,
  query?: string,
  sortBy?: string,
  sortOrder?: SORT_ORDER,
  filterAuthor?: number,
  filterGenre?: number,
  filterTheme?: number,
  filterProgressStatus?: keyof typeof PROGRESS_STATUS,
  filterMALScore?: string,
  filterPersonalScore?: string
): Promise<ApiResponseList<LightNovelList[]>> => {
  try {
    const response = await axiosClient.get(BASE_LIGHTNOVEL_URL, {
      params: {
        currentPage,
        limitPerPage,
        q: query,
        sortBy,
        sortOrder,
        filterAuthor,
        filterGenre,
        filterTheme,
        filterProgressStatus,
        filterMALScore,
        filterPersonalScore
      }
    });
    return { success: true, data: response.data.data };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error:
        error instanceof AxiosError && error.response?.data.error
          ? error.response?.data.error
          : "There was a problem with your request."
    };
  }
};

const fetchLightNovelByIdService = async (
  id: number
): Promise<ApiResponse<LightNovelDetail>> => {
  try {
    const response = await axiosClient.get(`${BASE_LIGHTNOVEL_URL}/${id}`);
    return { success: true, data: response.data.data };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error:
        error instanceof AxiosError && error.response?.data.error
          ? error.response?.data.error
          : "There was a problem with your request."
    };
  }
};

const fetchTotalLightNovelCount = async (): Promise<
  ApiResponse<{ count: number }>
> => {
  try {
    const response = await axiosClient.get(`${BASE_LIGHTNOVEL_URL}/total`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error:
        error instanceof AxiosError && error.response?.data.error
          ? error.response?.data.error
          : "There was a problem with your request."
    };
  }
};

const fetchLightNovelSitemap = async (
  page: number,
  limit: number
): Promise<ApiResponse<LightNovelSitemap[]>> => {
  try {
    const response = await axiosClient.get(`${BASE_LIGHTNOVEL_URL}/sitemap`, {
      params: { page, limit }
    });
    return { success: true, data: response.data.data };
  } catch (error) {
    console.error(error);
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
  fetchAllLightNovelService,
  fetchLightNovelByIdService,
  fetchTotalLightNovelCount,
  fetchLightNovelSitemap
};
