import { ApiResponse, ApiResponseList } from "@/types/api.type";
import { MangaDetail, MangaList, MangaSitemap } from "@/types/manga.type";

import { axiosClient } from "@/lib/axios";
import { PROGRESS_STATUS, SORT_ORDER } from "@/lib/enums";

import { AxiosError } from "axios";

const BASE_MANGA_URL = "/api/manga";

const fetchAllMangaService = async (
  currentPage: number,
  limitPerPage: number,
  query?: string,
  sortBy?: string,
  sortOrder?: SORT_ORDER,
  filterAuthor?: number,
  filterGenre?: number,
  filterTheme?: number,
  filterProgressStatus?: keyof typeof PROGRESS_STATUS,
  filterMALScore?: string,
  filterPersonalScore?: string
): Promise<ApiResponseList<MangaList[]>> => {
  try {
    const response = await axiosClient.get(BASE_MANGA_URL, {
      params: {
        currentPage,
        limitPerPage,
        q: query,
        sortBy,
        sortOrder,
        filterAuthor,
        filterGenre,
        filterTheme,
        filterProgressStatus,
        filterMALScore,
        filterPersonalScore
      }
    });
    return { success: true, data: response.data.data };
  } catch (error) {
    console.error(error);
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
    const response = await axiosClient.get(`${BASE_MANGA_URL}/${id}`);
    return { success: true, data: response.data.data };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error:
        error instanceof AxiosError && error.response?.data.error
          ? error.response?.data.error
          : "There was a problem with your request."
    };
  }
};

const fetchTotalMangaCount = async (): Promise<
  ApiResponse<{ count: number }>
> => {
  try {
    const response = await axiosClient.get(`${BASE_MANGA_URL}/total`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error:
        error instanceof AxiosError && error.response?.data.error
          ? error.response?.data.error
          : "There was a problem with your request."
    };
  }
};

const fetchMangaSitemap = async (
  page: number,
  limit: number
): Promise<ApiResponse<MangaSitemap[]>> => {
  try {
    const response = await axiosClient.get(`${BASE_MANGA_URL}/sitemap`, {
      params: { page, limit }
    });
    return { success: true, data: response.data.data };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error:
        error instanceof AxiosError && error.response?.data.error
          ? error.response?.data.error
          : "There was a problem with your request."
    };
  }
};

export {
  fetchAllMangaService,
  fetchMangaByIdService,
  fetchTotalMangaCount,
  fetchMangaSitemap
};
