import { SORT_ORDER } from "@/lib/enums";
import {
  LightNovelDetail,
  LightNovelList,
  LightNovelPostRequest,
  LightNovelReview
} from "@/types/lightnovel.type";
import {
  ApiResponse,
  ApiResponseList,
  MessageResponse
} from "@/types/api.type";
import { AxiosError } from "axios";
import interceptedAxios from "@/lib/axios";

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
    const response = await interceptedAxios.get(BASE_LIGHTNOVEL_URL, {
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
    const response = await interceptedAxios.get(`${BASE_LIGHTNOVEL_URL}/${id}`);
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

const addLightNovelService = async (
  data: LightNovelPostRequest
): Promise<ApiResponse<MessageResponse>> => {
  try {
    const response = await interceptedAxios.post(BASE_LIGHTNOVEL_URL, data);
    return { success: true, data: response.data };
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

const updateLightNovelReviewService = async (
  id: string,
  data: LightNovelReview
): Promise<ApiResponse<MessageResponse>> => {
  try {
    const response = await interceptedAxios.put(
      `${BASE_LIGHTNOVEL_URL}/review/${id}`,
      data
    );
    return { success: true, data: response.data };
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

const deleteLightNovelService = async (
  ids: string[]
): Promise<ApiResponse<void>> => {
  try {
    await interceptedAxios.delete(BASE_LIGHTNOVEL_URL, { data: { ids } });
    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof AxiosError
          ? error.response?.data.error
          : "There was a problem with your request."
    };
  }
};

export {
  fetchAllLightNovelService,
  fetchLightNovelByIdService,
  addLightNovelService,
  updateLightNovelReviewService,
  deleteLightNovelService
};
