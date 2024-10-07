import { SORT_ORDER } from "@/lib/enums";
import {
  MangaDetail,
  MangaList,
  MangaPostRequest,
  MangaReview
} from "@/types/manga.type";
import {
  ApiResponse,
  ApiResponseList,
  MessageResponse
} from "@/types/api.type";
import { AxiosError } from "axios";
import interceptedAxios from "@/lib/axios";

const BASE_MANGA_URL = "/api/manga";

const fetchAllMangaService = async (
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
): Promise<ApiResponseList<MangaList[]>> => {
  try {
    const response = await interceptedAxios.get(BASE_MANGA_URL, {
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

const fetchMangaByIdService = async (
  id: string
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

const addMangaService = async (
  data: MangaPostRequest
): Promise<ApiResponse<MessageResponse>> => {
  try {
    const response = await interceptedAxios.post(BASE_MANGA_URL, data);
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
  id: string,
  data: MangaReview
): Promise<ApiResponse<MessageResponse>> => {
  try {
    const response = await interceptedAxios.put(
      `${BASE_MANGA_URL}/review/${id}`,
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

const deleteMangaService = async (
  ids: string[]
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
  addMangaService,
  updateMangaReviewService,
  deleteMangaService
};
