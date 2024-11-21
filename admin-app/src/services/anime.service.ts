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
  currentPage: number,
  limitPerPage: number,
  query?: string,
  sortBy?: string,
  sortOrder?: SORT_ORDER,
  filterGenre?: string,
  filterStudio?: string,
  filterTheme?: string,
  filterMALScore?: string,
  filterPersonalScore?: string,
  filterType?: string,
  filterStatusCheck?: string
): Promise<ApiResponseList<AnimeList[]>> => {
  try {
    const response = await interceptedAxios.get(BASE_ANIME_URL, {
      params: {
        currentPage,
        limitPerPage,
        q: query,
        sortBy,
        sortOrder,
        filterGenre,
        filterStudio,
        filterTheme,
        filterMALScore,
        filterPersonalScore,
        filterType,
        filterStatusCheck
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
  id: string
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
  malId: string
): Promise<ApiResponse<{ exists: boolean }>> => {
  try {
    const response = await interceptedAxios.get(
      `${BASE_ANIME_URL}/duplicate/${malId}`
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
  id: string,
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
  id: string,
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
  ids: string[]
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
