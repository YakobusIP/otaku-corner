import { MetadataResponse } from "@/types/api.type";
import {
  LightNovelCreateRequest,
  LightNovelDetail,
  LightNovelList,
  LightNovelReviewRequest
} from "@/types/lightnovel.type";

import interceptedAxios, { handleAxiosError } from "@/lib/axios";
import { PROGRESS_STATUS, SORT_ORDER } from "@/lib/enums";

const BASE_LIGHTNOVEL_URL = "/api/light-novels";
type ServiceResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

type PaginatedBody<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

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
        PaginatedBody<LightNovelList>
      >(BASE_LIGHTNOVEL_URL, {
        params: {
          page,
          limit,
          query,
          sort,
          order,
          author,
          genre,
          theme,
          status,
          malScore: mal_score,
          personalScore: personal_score,
          statusCheck: status_check
        }
      });
      const body = response.data;
      return {
        data: body.data,
        metadata: {
          page: body.page,
          limit: body.limit,
          pageCount: body.totalPages,
          itemCount: body.total
        } satisfies MetadataResponse
      };
    } catch (error) {
      const message = handleAxiosError(error);
      throw new Error(message);
    }
  };

  const fetchById = async (id: number) => {
    try {
      const response = await interceptedAxios.get<LightNovelDetail>(
        `${BASE_LIGHTNOVEL_URL}/${id}`
      );
      return response.data;
    } catch (error) {
      const message = handleAxiosError(error);
      throw new Error(message);
    }
  };

  const fetchDuplicate = async (id: number) => {
    try {
      const response = await interceptedAxios.get<boolean>(
        `${BASE_LIGHTNOVEL_URL}/duplicate/${id}`
      );
      return { exists: response.data };
    } catch (error) {
      const message = handleAxiosError(error);
      throw new Error(message);
    }
  };

  const create = async (data: LightNovelCreateRequest[]) => {
    try {
      const response = await interceptedAxios.post<number[]>(
        `${BASE_LIGHTNOVEL_URL}/bulk`,
        { data }
      );
      return response.data;
    } catch (error) {
      const message = handleAxiosError(error);
      throw new Error(message);
    }
  };

  const updateReview = async (id: number, data: LightNovelReviewRequest) => {
    try {
      const response = await interceptedAxios.put<{ message?: string }>(
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
      const response = await interceptedAxios.put<{ message?: string }>(
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
      const response = await interceptedAxios.put<{ message?: string }>(
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
      const response = await interceptedAxios.put<{ message?: string }>(
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
      await interceptedAxios.delete(BASE_LIGHTNOVEL_URL, {
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

const fetchLightNovelByIdService = async (
  id: number
): Promise<ServiceResult<LightNovelDetail>> => {
  try {
    return { success: true, data: await lightNovelService.fetchById(id) };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};

const fetchLightNovelDuplicate = async (
  id: number
): Promise<ServiceResult<{ exists: boolean }>> => {
  try {
    return { success: true, data: await lightNovelService.fetchDuplicate(id) };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};

const addLightNovelService = async (
  data: LightNovelCreateRequest[]
): Promise<ServiceResult<number[]>> => {
  try {
    return { success: true, data: await lightNovelService.create(data) };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};

const updateLightNovelReviewService = async (
  id: number,
  data: LightNovelReviewRequest
): Promise<ServiceResult<{ message?: string }>> => {
  try {
    return {
      success: true,
      data: await lightNovelService.updateReview(id, data)
    };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};

const updateLightNovelProgressStatusService = async (
  id: number,
  progressStatus: PROGRESS_STATUS
): Promise<ServiceResult<{ message?: string }>> => {
  try {
    return {
      success: true,
      data: await lightNovelService.updateProgressStatus(id, progressStatus)
    };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};

const updateLightNovelVolumesService = async (
  id: number,
  volumesCount: number
): Promise<ServiceResult<{ message?: string }>> => {
  try {
    return {
      success: true,
      data: await lightNovelService.updateVolumes(id, volumesCount)
    };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};

const updateLightNovelVolumeProgressService = async (
  data: { id: number; consumedAt?: Date | null }[]
): Promise<ServiceResult<{ message?: string }>> => {
  try {
    return {
      success: true,
      data: await lightNovelService.updateVolumeProgress(data)
    };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};

export {
  lightNovelService,
  fetchLightNovelByIdService,
  fetchLightNovelDuplicate,
  addLightNovelService,
  updateLightNovelReviewService,
  updateLightNovelProgressStatusService,
  updateLightNovelVolumesService,
  updateLightNovelVolumeProgressService
};
