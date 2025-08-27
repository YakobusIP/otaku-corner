import {
  ApiResponse,
  ApiResponseList,
  MessageResponse
} from "@/types/api.type";
import {
  LightNovelCreateRequest,
  LightNovelDetail,
  LightNovelList,
  LightNovelReviewRequest
} from "@/types/lightnovel.type";

import interceptedAxios from "@/lib/axios";
import { PROGRESS_STATUS, SORT_ORDER } from "@/lib/enums";

import { AxiosError } from "axios";

const BASE_LIGHTNOVEL_URL = "/api/light-novel";

const fetchAllLightNovelService = async (
  page: number,
  limit: number,
  query?: string,
  sort?: string,
  order?: SORT_ORDER,
  author?: number,
  genre?: number,
  theme?: number,
  status?: keyof typeof PROGRESS_STATUS,
  mal_score?: string,
  personal_score?: string,
  status_check?: string
): Promise<ApiResponseList<LightNovelList[]>> => {
  try {
    const response = await interceptedAxios.get(BASE_LIGHTNOVEL_URL, {
      params: {
        page,
        limit,
        q: query,
        sort,
        order,
        author,
        genre,
        theme,
        status,
        mal_score,
        personal_score,
        status_check
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
  id: number
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

const fetchLightNovelDuplicate = async (
  id: number
): Promise<ApiResponse<{ exists: boolean }>> => {
  try {
    const response = await interceptedAxios.get(
      `${BASE_LIGHTNOVEL_URL}/duplicate/${id}`
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

const addLightNovelService = async (
  data: LightNovelCreateRequest[]
): Promise<ApiResponse<MessageResponse>> => {
  try {
    const response = await interceptedAxios.post(BASE_LIGHTNOVEL_URL, { data });
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
  id: number,
  data: LightNovelReviewRequest
): Promise<ApiResponse<MessageResponse>> => {
  try {
    const response = await interceptedAxios.put(
      `${BASE_LIGHTNOVEL_URL}/${id}/review`,
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

const updateLightNovelProgressStatusService = async (
  id: number,
  data: PROGRESS_STATUS
): Promise<ApiResponse<MessageResponse>> => {
  try {
    const response = await interceptedAxios.put(
      `${BASE_LIGHTNOVEL_URL}/${id}/review`,
      { progressStatus: data }
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

const updateLightNovelVolumesService = async (
  id: number,
  volumesCount: number
): Promise<ApiResponse<MessageResponse>> => {
  try {
    const response = await interceptedAxios.put(
      `${BASE_LIGHTNOVEL_URL}/${id}`,
      { volumesCount }
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

const updateLightNovelVolumeProgressService = async (
  data: { id: number; consumedAt?: Date | null }[]
): Promise<ApiResponse<MessageResponse>> => {
  try {
    const response = await interceptedAxios.put(
      `${BASE_LIGHTNOVEL_URL}/volume-progress`,
      { data }
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
  ids: number[]
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
  fetchLightNovelDuplicate,
  addLightNovelService,
  updateLightNovelReviewService,
  updateLightNovelProgressStatusService,
  updateLightNovelVolumesService,
  updateLightNovelVolumeProgressService,
  deleteLightNovelService
};
