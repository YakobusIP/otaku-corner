import { ApiResponse, ApiResponseList } from "@/types/api.type";
import {
  LightNovelDetail,
  LightNovelList,
  LightNovelSitemap
} from "@/types/lightnovel.type";
import { StatusFilter } from "@/types/statistic.type";

import { axiosClient, handleAxiosError } from "@/lib/axios";
import { PROGRESS_STATUS, SORT_ORDER } from "@/lib/enums";

const BASE_LIGHTNOVEL_URL = "/api/light-novel";

const createLightNovelService = () => {
  const fetchAll = async (
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
    personal_score?: string
  ) => {
    try {
      const response = await axiosClient.get<ApiResponseList<LightNovelList[]>>(
        BASE_LIGHTNOVEL_URL,
        {
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
            personal_score
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
      const response = await axiosClient.get<ApiResponse<LightNovelDetail>>(
        `${BASE_LIGHTNOVEL_URL}/${id}`
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
        `${BASE_LIGHTNOVEL_URL}/total`
      );
      return response.data;
    } catch (error) {
      const message = handleAxiosError(error);
      throw new Error(message);
    }
  };

  const fetchSitemap = async (page: number, limit: number) => {
    try {
      const response = await axiosClient.get<ApiResponse<LightNovelSitemap[]>>(
        `${BASE_LIGHTNOVEL_URL}/sitemap`,
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
        `${BASE_LIGHTNOVEL_URL}/status-count`
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

const lightNovelService = createLightNovelService();

export { lightNovelService };
