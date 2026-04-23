import { MetadataResponse } from "@/types/api.type";
import {
  MangaCreateRequest,
  MangaDetail,
  MangaList,
  MangaReviewRequest
} from "@/types/manga.type";

import interceptedAxios, { handleAxiosError } from "@/lib/axios";
import { PROGRESS_STATUS, SORT_ORDER } from "@/lib/enums";

const BASE_MANGA_URL = "/api/mangas";
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
      const response = await interceptedAxios.get<PaginatedBody<MangaList>>(
        BASE_MANGA_URL,
        {
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
        }
      );
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
      const response = await interceptedAxios.get<MangaDetail>(
        `${BASE_MANGA_URL}/${id}`
      );
      return response.data;
    } catch (error) {
      const message = handleAxiosError(error);
      throw new Error(message);
    }
  };

  const fetchDuplicate = async (id: number) => {
    try {
      const response = await interceptedAxios.get<{ exists: boolean }>(
        `${BASE_MANGA_URL}/duplicate/${id}`
      );
      return response.data;
    } catch (error) {
      const message = handleAxiosError(error);
      throw new Error(message);
    }
  };

  const create = async (data: MangaCreateRequest[]) => {
    try {
      const response = await interceptedAxios.post<number[]>(
        `${BASE_MANGA_URL}/bulk`,
        { data }
      );
      return response.data;
    } catch (error) {
      const message = handleAxiosError(error);
      throw new Error(message);
    }
  };

  const updateReview = async (id: number, data: MangaReviewRequest) => {
    try {
      const response = await interceptedAxios.put<{ message?: string }>(
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
      const response = await interceptedAxios.put<{ message?: string }>(
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
      const response = await interceptedAxios.put<{ message?: string }>(
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
      await interceptedAxios.delete(BASE_MANGA_URL, {
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

const fetchMangaByIdService = async (
  id: number
): Promise<ServiceResult<MangaDetail>> => {
  try {
    return { success: true, data: await mangaService.fetchById(id) };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};

const fetchMangaDuplicate = async (
  id: number
): Promise<ServiceResult<{ exists: boolean }>> => {
  try {
    return { success: true, data: await mangaService.fetchDuplicate(id) };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};

const addMangaService = async (
  data: MangaCreateRequest[]
): Promise<ServiceResult<number[]>> => {
  try {
    return { success: true, data: await mangaService.create(data) };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};

const updateMangaReviewService = async (
  id: number,
  data: MangaReviewRequest
): Promise<ServiceResult<{ message?: string }>> => {
  try {
    return { success: true, data: await mangaService.updateReview(id, data) };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};

const updateMangaProgressStatusService = async (
  id: number,
  progressStatus: PROGRESS_STATUS
): Promise<ServiceResult<{ message?: string }>> => {
  try {
    return {
      success: true,
      data: await mangaService.updateProgressStatus(id, progressStatus)
    };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};

const updateMangaVolumeAndChaptersService = async (
  id: number,
  chaptersCount: number,
  volumesCount: number
): Promise<ServiceResult<{ message?: string }>> => {
  try {
    return {
      success: true,
      data: await mangaService.updateVolumeAndChapters(
        id,
        chaptersCount,
        volumesCount
      )
    };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};

export {
  mangaService,
  fetchMangaByIdService,
  fetchMangaDuplicate,
  addMangaService,
  updateMangaReviewService,
  updateMangaProgressStatusService,
  updateMangaVolumeAndChaptersService
};
