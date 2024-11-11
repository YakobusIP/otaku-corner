import { AnimeDetail, AnimeList } from "@/types/anime.type";
import { ApiResponse, ApiResponseList } from "@/types/api.type";

import { axiosClient } from "@/lib/axios";
import { SORT_ORDER } from "@/lib/enums";

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
  filterType?: string
): Promise<ApiResponseList<AnimeList[]>> => {
  try {
    const response = await axiosClient.get(BASE_ANIME_URL, {
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
  id: string
): Promise<ApiResponse<AnimeDetail>> => {
  try {
    const response = await axiosClient.get(`${BASE_ANIME_URL}/${id}`);
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

export { fetchAllAnimeService, fetchAnimeByIdService };