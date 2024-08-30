import { SortOrder } from "@/enum/general.enum";
import {
  AnimeDetail,
  AnimeList,
  AnimePostRequest,
  AnimeReview
} from "@/types/anime.type";
import axios, { AxiosError } from "axios";

const BASE_ANIME_URL = "/api/anime";

export interface ApiResponseSuccess<T> {
  success: true;
  data: T;
}

export interface ApiResponseError {
  success: false;
  error: string;
}

export type ApiResponse<T> = ApiResponseSuccess<T> | ApiResponseError;

type MessageResponse = {
  message: string;
};

const fetchAllAnimeService = async (
  query?: string,
  sortBy?: string,
  sortOrder?: SortOrder,
  filterGenre?: string,
  filterScore?: string,
  filterType?: string
): Promise<ApiResponse<Array<AnimeList>>> => {
  try {
    const response = await axios.get(BASE_ANIME_URL, {
      params: {
        q: query,
        sortBy,
        sortOrder,
        filterGenre,
        filterScore,
        filterType
      }
    });
    return { success: true, data: response.data.data };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof AxiosError &&
        error.response?.data.error instanceof String
          ? error.response?.data.error
          : "There was a problem with your request."
    };
  }
};

const fetchAnimeByIdService = async (
  id: string
): Promise<ApiResponse<AnimeDetail>> => {
  try {
    const response = await axios.get(`${BASE_ANIME_URL}/${id}`);
    return { success: true, data: response.data.data };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof AxiosError &&
        error.response?.data.error instanceof String
          ? error.response?.data.error
          : "There was a problem with your request."
    };
  }
};

const addAnimeService = async (
  data: AnimePostRequest
): Promise<ApiResponse<MessageResponse>> => {
  try {
    const response = await axios.post(BASE_ANIME_URL, data);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof AxiosError &&
        error.response?.data.error instanceof String
          ? error.response?.data.error
          : "There was a problem with your request."
    };
  }
};

const updateAnimeReviewService = async (
  id: string,
  data: AnimeReview
): Promise<ApiResponse<MessageResponse>> => {
  try {
    const response = await axios.put(`${BASE_ANIME_URL}/review/${id}`, data);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof AxiosError &&
        error.response?.data.error instanceof String
          ? error.response?.data.error
          : "There was a problem with your request."
    };
  }
};

const deleteAnimeService = async (
  ids: Array<string>
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
  fetchAllAnimeService,
  fetchAnimeByIdService,
  addAnimeService,
  updateAnimeReviewService,
  deleteAnimeService
};
