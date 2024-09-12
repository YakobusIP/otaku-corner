import { SortOrder } from "@/enum/general.enum";
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
import axios, { AxiosError } from "axios";

const BASE_ANIME_URL = "/api/manga";

const fetchAllMangaService = async (
  currentPage: number,
  limitPerPage: number,
  query?: string,
  sortBy?: string,
  sortOrder?: SortOrder,
  filterAuthor?: number,
  filterGenre?: number,
  filterTheme?: number,
  filterMALScore?: string,
  filterPersonalScore?: string
): Promise<ApiResponseList<MangaList[]>> => {
  try {
    const response = await axios.get(BASE_ANIME_URL, {
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
    const response = await axios.get(`${BASE_ANIME_URL}/${id}`);
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
    const response = await axios.post(BASE_ANIME_URL, data);
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
    const response = await axios.put(`${BASE_ANIME_URL}/review/${id}`, data);
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
    await axios.delete(BASE_ANIME_URL, { data: { ids } });
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
