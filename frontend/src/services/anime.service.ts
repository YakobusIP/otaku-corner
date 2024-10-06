import { SORT_ORDER } from "@/lib/enums";
import interceptedAxios from "@/lib/axios";
import {
  AnimeDetail,
  AnimeList,
  AnimePostRequest,
  AnimeReview
} from "@/types/anime.type";
import {
  ApiResponse,
  ApiResponseList,
  MessageResponse
} from "@/types/api.type";
import { AxiosError } from "axios";

const BASE_ANIME_URL = "/api/anime";

const fetchAllAnimeService = async (
  currentPage: number,
  limitPerPage: number,
  query?: string,
  sortBy?: string,
  SORT_ORDER?: SORT_ORDER,
  filterGenre?: number,
  filterStudio?: number,
  filterTheme?: number,
  filterMALScore?: string,
  filterPersonalScore?: string,
  filterType?: string
): Promise<ApiResponseList<AnimeList[]>> => {
  try {
    const response = await interceptedAxios.get(BASE_ANIME_URL, {
      params: {
        currentPage,
        limitPerPage,
        q: query,
        sortBy,
        SORT_ORDER,
        filterGenre,
        filterStudio,
        filterTheme,
        filterMALScore,
        filterPersonalScore,
        filterType
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

const addAnimeService = async (
  data: AnimePostRequest
): Promise<ApiResponse<MessageResponse>> => {
  try {
    const response = await interceptedAxios.post(BASE_ANIME_URL, data);
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
  data: AnimeReview
): Promise<ApiResponse<MessageResponse>> => {
  try {
    const response = await interceptedAxios.put(
      `${BASE_ANIME_URL}/review/${id}`,
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
  addAnimeService,
  updateAnimeReviewService,
  deleteAnimeService
};
