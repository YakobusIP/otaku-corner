import {
  AnimeCreateRequest,
  AnimeDetail,
  AnimeList,
  AnimeReviewRequest
} from "@/types/anime.type";
import {
  ApiResponse,
  ApiResponseList,
  MessageResponse
} from "@/types/api.type";

import interceptedAxios from "@/lib/axios";
import { PROGRESS_STATUS, SORT_ORDER } from "@/lib/enums";

import { AxiosError } from "axios";

const BASE_ANIME_URL = "/api/anime";

const fetchAllAnimeService = async (
  page: number,
  limit: number,
  query?: string,
  sort?: string,
  order?: SORT_ORDER,
  genre?: number,
  studio?: number,
  theme?: number,
  status?: keyof typeof PROGRESS_STATUS,
  mal_score?: string,
  personal_score?: string,
  type?: string,
  status_check?: string
): Promise<ApiResponseList<AnimeList[]>> => {
  try {
    const response = await interceptedAxios.get(BASE_ANIME_URL, {
      params: {
        page,
        limit,
        q: query,
        sort,
        order,
        genre,
        studio,
        theme,
        status,
        mal_score,
        personal_score,
        type,
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

const fetchAnimeByIdService = async (
  id: number
): Promise<ApiResponse<AnimeDetail>> => {
  try {
    const response = await interceptedAxios.get(`${BASE_ANIME_URL}/${id}`);
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

const fetchAnimeDuplicate = async (
  id: number
): Promise<ApiResponse<{ exists: boolean }>> => {
  try {
    const response = await interceptedAxios.get(
      `${BASE_ANIME_URL}/duplicate/${id}`
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

const addAnimeService = async (
  data: AnimeCreateRequest[]
): Promise<ApiResponse<MessageResponse>> => {
  try {
    const response = await interceptedAxios.post(BASE_ANIME_URL, { data });
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

const updateAnimeReviewService = async (
  id: number,
  data: AnimeReviewRequest
): Promise<ApiResponse<MessageResponse>> => {
  try {
    const response = await interceptedAxios.put(
      `${BASE_ANIME_URL}/${id}/review`,
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

const updateAnimeProgressStatusService = async (
  id: number,
  data: PROGRESS_STATUS
): Promise<ApiResponse<MessageResponse>> => {
  try {
    const response = await interceptedAxios.put(
      `${BASE_ANIME_URL}/${id}/review`,
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

const deleteAnimeService = async (
  ids: number[]
): Promise<ApiResponse<void>> => {
  try {
    await interceptedAxios.delete(BASE_ANIME_URL, { data: { ids } });
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
  fetchAllAnimeService,
  fetchAnimeByIdService,
  fetchAnimeDuplicate,
  addAnimeService,
  updateAnimeReviewService,
  updateAnimeProgressStatusService,
  deleteAnimeService
};
