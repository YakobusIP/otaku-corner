import {
  AnimeCreateRequest,
  AnimeDetail,
  AnimeFilterSort,
  AnimeList,
  AnimeReviewRequest
} from "@/types/anime.type";
import {
  ApiResponse,
  ApiResponseList,
  MessageResponse
} from "@/types/api.type";
import { StatusFilter } from "@/types/statistic.type";

import interceptedAxios, { handleAxiosError } from "@/lib/axios";
import { PROGRESS_STATUS, SORT_ORDER } from "@/lib/enums";

const BASE_ANIME_URL = "/api/anime";

export type ListQuery = {
  page: number;
  limit: number;
  query?: string;
  sort?: string;
  order?: SORT_ORDER;
  genre?: number;
  studio?: number;
  theme?: number;
  status?: keyof typeof PROGRESS_STATUS;
  mal_score?: string;
  personal_score?: string;
  type?: string;
  status_check?: string;
};

const createAnimeService = () => {
  const list = async (params: AnimeFilterSort) => {
    try {
      const response = await interceptedAxios.get<ApiResponseList<AnimeList[]>>(
        BASE_ANIME_URL,
        {
          params: {
            page: params.page,
            limit: params.limit,
            q: params.query,
            sort: params.sortBy,
            order: params.sortOrder,
            genre: params.filterGenre,
            studio: params.filterStudio,
            theme: params.filterTheme,
            status: params.filterProgressStatus,
            mal_score: params.filterMALScore,
            personal_score: params.filterPersonalScore,
            type: params.filterType,
            status_check: params.filterStatusCheck
          }
        }
      );
      return response.data.data;
    } catch (error) {
      const message = handleAxiosError(error);
      throw new Error(message);
    }
  };

  const get = async (id: number) => {
    try {
      const response = await interceptedAxios.get<ApiResponse<AnimeDetail>>(
        `${BASE_ANIME_URL}/${id}`
      );
      return response.data.data;
    } catch (error) {
      const message = handleAxiosError(error);
      throw new Error(message);
    }
  };

  const getDuplicates = async (id: number) => {
    try {
      const response = await interceptedAxios.get<
        ApiResponse<{ exists: boolean }>
      >(`${BASE_ANIME_URL}/duplicate/${id}`);
      return response.data;
    } catch (error) {
      const message = handleAxiosError(error);
      throw new Error(message);
    }
  };

  const getStatusCounts = async () => {
    try {
      const response = await interceptedAxios.get<ApiResponse<StatusFilter[]>>(
        `${BASE_ANIME_URL}/status-count`
      );
      return response.data.data;
    } catch (error) {
      const message = handleAxiosError(error);
      throw new Error(message);
    }
  };

  const create = async (data: AnimeCreateRequest[]) => {
    try {
      const response = await interceptedAxios.post<
        ApiResponse<MessageResponse>
      >(BASE_ANIME_URL, { data });
      return response.data;
    } catch (error) {
      const message = handleAxiosError(error);
      throw new Error(message);
    }
  };

  const updateReview = async (id: number, data: AnimeReviewRequest) => {
    try {
      const response = await interceptedAxios.put<ApiResponse<MessageResponse>>(
        `${BASE_ANIME_URL}/${id}/review`,
        data
      );
      return response.data;
    } catch (error) {
      const message = handleAxiosError(error);
      throw new Error(message);
    }
  };

  const updateProgressStatus = async (
    id: number,
    data: PROGRESS_STATUS
  ): Promise<ApiResponse<MessageResponse>> => {
    try {
      const response = await interceptedAxios.put(
        `${BASE_ANIME_URL}/${id}/review`,
        { progressStatus: data }
      );
      return response.data;
    } catch (error) {
      const message = handleAxiosError(error);
      throw new Error(message);
    }
  };

  const remove = async (ids: number[]) => {
    try {
      await interceptedAxios.delete<ApiResponse<void>>(BASE_ANIME_URL, {
        data: { ids }
      });
      return undefined;
    } catch (error) {
      const message = handleAxiosError(error);
      throw new Error(message);
    }
  };

  return {
    list,
    get,
    getDuplicates,
    getStatusCounts,
    create,
    updateReview,
    updateProgressStatus,
    remove
  };
};

const animeService = createAnimeService();

export { animeService };
