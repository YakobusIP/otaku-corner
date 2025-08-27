import {
  ApiResponse,
  ApiResponseList,
  MessageResponse
} from "@/types/api.type";
import {
  MangaCreateRequest,
  MangaDetail,
  MangaList,
  MangaReviewRequest
} from "@/types/manga.type";

import interceptedAxios from "@/lib/axios";
import { PROGRESS_STATUS, SORT_ORDER } from "@/lib/enums";

import { AxiosError } from "axios";

const BASE_MANGA_URL = "/api/manga";

const fetchAllMangaService = async (
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
): Promise<ApiResponseList<MangaList[]>> => {
  try {
    const response = await interceptedAxios.get(BASE_MANGA_URL, {
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

const fetchMangaByIdService = async (
  id: number
): Promise<ApiResponse<MangaDetail>> => {
  try {
    const response = await interceptedAxios.get(`${BASE_MANGA_URL}/${id}`);
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

const fetchMangaDuplicate = async (
  id: number
): Promise<ApiResponse<{ exists: boolean }>> => {
  try {
    const response = await interceptedAxios.get(
      `${BASE_MANGA_URL}/duplicate/${id}`
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

const addMangaService = async (
  data: MangaCreateRequest[]
): Promise<ApiResponse<MessageResponse>> => {
  try {
    const response = await interceptedAxios.post(BASE_MANGA_URL, { data });
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

const updateMangaReviewService = async (
  id: number,
  data: MangaReviewRequest
): Promise<ApiResponse<MessageResponse>> => {
  try {
    const response = await interceptedAxios.put(
      `${BASE_MANGA_URL}/${id}/review`,
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

const updateMangaProgressStatusService = async (
  id: number,
  data: PROGRESS_STATUS
): Promise<ApiResponse<MessageResponse>> => {
  try {
    const response = await interceptedAxios.put(
      `${BASE_MANGA_URL}/${id}/review`,
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

const updateMangaVolumeAndChaptersService = async (
  id: number,
  chaptersCount: number,
  volumesCount: number
): Promise<ApiResponse<MessageResponse>> => {
  try {
    const response = await interceptedAxios.put(`${BASE_MANGA_URL}/${id}`, {
      chaptersCount,
      volumesCount
    });
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

const deleteMangaService = async (
  ids: number[]
): Promise<ApiResponse<void>> => {
  try {
    await interceptedAxios.delete(BASE_MANGA_URL, { data: { ids } });
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
  fetchAllMangaService,
  fetchMangaByIdService,
  fetchMangaDuplicate,
  addMangaService,
  updateMangaReviewService,
  updateMangaProgressStatusService,
  updateMangaVolumeAndChaptersService,
  deleteMangaService
};
