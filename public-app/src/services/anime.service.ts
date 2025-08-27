import { AnimeDetail, AnimeList, AnimeSitemap } from "@/types/anime.type";
import { ApiResponse, ApiResponseList } from "@/types/api.type";
import { StatusFilter } from "@/types/statistic.type";

import { axiosClient, handleAxiosError } from "@/lib/axios";
import { PROGRESS_STATUS, SORT_ORDER } from "@/lib/enums";

const BASE_ANIME_URL = "/api/anime";

const createAnimeService = () => {
  const fetchAll = async (
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
    type?: string
  ) => {
    try {
      const response = await axiosClient.get<ApiResponseList<AnimeList[]>>(
        BASE_ANIME_URL,
        {
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
            type
          }
        }
      );
      return response.data.data;
    } catch (error) {
      const message = handleAxiosError(error);
      throw new Error(message);
    }
  };

  const fetchById = async (id: number) => {
    try {
      const response = await axiosClient.get<ApiResponse<AnimeDetail>>(
        `${BASE_ANIME_URL}/${id}`
      );
      return response.data.data;
    } catch (error) {
      const message = handleAxiosError(error);
      throw new Error(message);
    }
  };

  const fetchTotalCount = async () => {
    try {
      const response = await axiosClient.get<{ count: number }>(
        `${BASE_ANIME_URL}/total`
      );
      return response.data;
    } catch (error) {
      const message = handleAxiosError(error);
      throw new Error(message);
    }
  };

  const fetchSitemap = async (page: number, limit: number) => {
    try {
      const response = await axiosClient.get<ApiResponse<AnimeSitemap[]>>(
        `${BASE_ANIME_URL}/sitemap`,
        {
          params: { page, limit }
        }
      );
      return response.data.data;
    } catch (error) {
      const message = handleAxiosError(error);
      throw new Error(message);
    }
  };

  const fetchStatusCounts = async () => {
    try {
      const response = await axiosClient.get<ApiResponse<StatusFilter[]>>(
        `${BASE_ANIME_URL}/status-count`
      );
      return response.data.data;
    } catch (error) {
      const message = handleAxiosError(error);
      throw new Error(message);
    }
  };

  return {
    fetchAll,
    fetchById,
    fetchTotalCount,
    fetchSitemap,
    fetchStatusCounts
  };
};

const animeService = createAnimeService();

export { animeService };
