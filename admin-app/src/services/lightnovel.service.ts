import {
  ApiResponse,
  ApiResponseList,
  MessageResponse
} from "@/types/api.type";
import {
  LightNovelCreateRequest,
  LightNovelDetail,
  LightNovelList,
  LightNovelReviewRequest
} from "@/types/lightnovel.type";

import interceptedAxios, { handleAxiosError } from "@/lib/axios";
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
    personal_score?: string,
    status_check?: string
  ) => {
    try {
      const response = await interceptedAxios.get<
        ApiResponseList<LightNovelList[]>
      >(BASE_LIGHTNOVEL_URL, {
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
      });
      return response.data.data;
    } catch (error) {
      const message = handleAxiosError(error);
      throw new Error(message);
    }
  };

  const fetchById = async (id: number) => {
    try {
      const response = await interceptedAxios.get<
        ApiResponse<LightNovelDetail>
      >(`${BASE_LIGHTNOVEL_URL}/${id}`);
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
      >(`${BASE_LIGHTNOVEL_URL}/duplicate/${id}`);
      return response.data;
    } catch (error) {
      const message = handleAxiosError(error);
      throw new Error(message);
    }
  };

  const create = async (data: LightNovelCreateRequest[]) => {
    try {
      const response = await interceptedAxios.post<
        ApiResponse<MessageResponse>
      >(BASE_LIGHTNOVEL_URL, { data });
      return response.data;
    } catch (error) {
      const message = handleAxiosError(error);
      throw new Error(message);
    }
  };

  const updateReview = async (id: number, data: LightNovelReviewRequest) => {
    try {
      const response = await interceptedAxios.put<ApiResponse<MessageResponse>>(
        `${BASE_LIGHTNOVEL_URL}/${id}/review`,
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
        `${BASE_LIGHTNOVEL_URL}/${id}/review`,
        { progressStatus: data }
      );
      return response.data;
    } catch (error) {
      const message = handleAxiosError(error);
      throw new Error(message);
    }
  };

  const updateVolumes = async (id: number, volumesCount: number) => {
    try {
      const response = await interceptedAxios.put<ApiResponse<MessageResponse>>(
        `${BASE_LIGHTNOVEL_URL}/${id}`,
        { volumesCount }
      );
      return response.data;
    } catch (error) {
      const message = handleAxiosError(error);
      throw new Error(message);
    }
  };

  const updateVolumeProgress = async (
    data: { id: number; consumedAt?: Date | null }[]
  ) => {
    try {
      const response = await interceptedAxios.put<ApiResponse<MessageResponse>>(
        `${BASE_LIGHTNOVEL_URL}/volume-progress`,
        { data }
      );
      return response.data;
    } catch (error) {
      const message = handleAxiosError(error);
      throw new Error(message);
    }
  };

  const remove = async (ids: number[]) => {
    try {
      await interceptedAxios.delete<ApiResponse<void>>(BASE_LIGHTNOVEL_URL, {
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
    updateVolumes,
    updateVolumeProgress,
    remove
  };
};

const lightNovelService = createLightNovelService();

export { lightNovelService };
