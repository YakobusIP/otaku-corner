import { ApiResponse, ApiResponseList } from "@/types/api.type";
import { LightNovelDetail, LightNovelList } from "@/types/lightnovel.type";

import { axiosClient } from "@/lib/axios";
import { SORT_ORDER } from "@/lib/enums";

import { AxiosError } from "axios";

const BASE_LIGHTNOVEL_URL = "/api/lightnovel";

const fetchAllLightNovelService = async (
  currentPage: number,
  limitPerPage: number,
  query?: string,
  sortBy?: string,
  sortOrder?: SORT_ORDER,
  filterAuthor?: string,
  filterGenre?: string,
  filterTheme?: string,
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
        filterMALScore,
        filterPersonalScore
      }
    });
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

const fetchLightNovelByIdService = async (
  id: string
): Promise<ApiResponse<LightNovelDetail>> => {
  try {
    const response = await axiosClient.get(`${BASE_LIGHTNOVEL_URL}/${id}`);
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

export { fetchAllLightNovelService, fetchLightNovelByIdService };
