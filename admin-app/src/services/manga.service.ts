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

import interceptedAxios, { handleAxiosError } from "@/lib/axios";
import { PROGRESS_STATUS, SORT_ORDER } from "@/lib/enums";

const BASE_MANGA_URL = "/api/manga";

const createMangaService = () => {
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
    personal_score?: string,
    status_check?: string
  ) => {
    try {
      const response = await interceptedAxios.get<ApiResponseList<MangaList[]>>(
        BASE_MANGA_URL,
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
            personal_score,
            status_check
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
      const response = await interceptedAxios.get<ApiResponse<MangaDetail>>(
        `${BASE_MANGA_URL}/${id}`
      );
      return response.data.data;
    } catch (error) {
      const message = handleAxiosError(error);
      throw new Error(message);
    }
  };

  const fetchDuplicate = async (id: number) => {
    try {
      const response = await interceptedAxios.get<
        ApiResponse<{ exists: boolean }>
      >(`${BASE_MANGA_URL}/duplicate/${id}`);
      return response.data;
    } catch (error) {
      const message = handleAxiosError(error);
      throw new Error(message);
    }
  };

  const create = async (data: MangaCreateRequest[]) => {
    try {
      const response = await interceptedAxios.post<
        ApiResponse<MessageResponse>
      >(BASE_MANGA_URL, { data });
      return response.data;
    } catch (error) {
      const message = handleAxiosError(error);
      throw new Error(message);
    }
  };

  const updateReview = async (id: number, data: MangaReviewRequest) => {
    try {
      const response = await interceptedAxios.put<ApiResponse<MessageResponse>>(
        `${BASE_MANGA_URL}/${id}/review`,
        data
      );
      return response.data;
    } catch (error) {
      const message = handleAxiosError(error);
      throw new Error(message);
    }
  };

  const updateProgressStatus = async (id: number, data: PROGRESS_STATUS) => {
    try {
      const response = await interceptedAxios.put<ApiResponse<MessageResponse>>(
        `${BASE_MANGA_URL}/${id}/review`,
        { progressStatus: data }
      );
      return response.data;
    } catch (error) {
      const message = handleAxiosError(error);
      throw new Error(message);
    }
  };

  const updateVolumeAndChapters = async (
    id: number,
    chaptersCount: number,
    volumesCount: number
  ) => {
    try {
      const response = await interceptedAxios.put<ApiResponse<MessageResponse>>(
        `${BASE_MANGA_URL}/${id}`,
        {
          chaptersCount,
          volumesCount
        }
      );
      return response.data;
    } catch (error) {
      const message = handleAxiosError(error);
      throw new Error(message);
    }
  };

  const remove = async (ids: number[]) => {
    try {
      await interceptedAxios.delete<ApiResponse<void>>(BASE_MANGA_URL, {
        data: { ids }
      });
      return undefined;
    } catch (error) {
      const message = handleAxiosError(error);
      throw new Error(message);
    }
  };

  return {
    fetchAll,
    fetchById,
    fetchDuplicate,
    create,
    updateReview,
    updateProgressStatus,
    updateVolumeAndChapters,
    remove
  };
};

const mangaService = createMangaService();

export { mangaService };
