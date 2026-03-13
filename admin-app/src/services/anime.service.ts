import {
  AnimeCreateRequest,
  AnimeDetail,
  AnimeFilterSort,
  AnimeList,
  AnimeReviewRequest
} from "@/types/anime.type";
import { MetadataResponse } from "@/types/api.type";
import { StatusFilter } from "@/types/statistic.type";

import interceptedAxios, { handleAxiosError } from "@/lib/axios";
import { PROGRESS_STATUS, SORT_ORDER } from "@/lib/enums";

const BASE_ANIME_URL = "/api/animes";

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

const createAnimeService = () => {
  const list = async (
    params: AnimeFilterSort & {
      page: number;
      limit: number;
      query?: string;
    }
  ) => {
    try {
      const response = await interceptedAxios.get<
        PaginatedBody<AnimeList>
      >(BASE_ANIME_URL, {
        params: {
          page: params.page,
          limit: params.limit,
          query: params.query,
          sort: params.sortBy,
          order: params.sortOrder,
          genre: params.filterGenre,
          studio: params.filterStudio,
          theme: params.filterTheme,
          status: params.filterProgressStatus,
          malScore: params.filterMALScore,
          personalScore: params.filterPersonalScore,
          type: params.filterType,
          statusCheck: params.filterStatusCheck
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
    malScore?: string,
    personalScore?: string,
    type?: string,
    statusCheck?: string
  ) =>
    list({
      page,
      limit,
      query,
      sortBy: sort ?? "title",
      sortOrder: order ?? SORT_ORDER.ASCENDING,
      filterGenre: genre,
      filterStudio: studio,
      filterTheme: theme,
      filterProgressStatus: status,
      filterMALScore: malScore,
      filterPersonalScore: personalScore,
      filterType: type,
      filterStatusCheck: statusCheck
    });

  const get = async (id: number) => {
    try {
      const response = await interceptedAxios.get<AnimeDetail>(
        `${BASE_ANIME_URL}/${id}`
      );
      return response.data;
    } catch (error) {
      const message = handleAxiosError(error);
      throw new Error(message);
    }
  };

  const getDuplicates = async (id: number) => {
    try {
      const response = await interceptedAxios.get<boolean>(
        `${BASE_ANIME_URL}/duplicate/${id}`
      );
      return { exists: response.data };
    } catch (error) {
      const message = handleAxiosError(error);
      throw new Error(message);
    }
  };

  const getStatusCounts = async () => {
    try {
      const response = await interceptedAxios.get<StatusFilter[]>(
        `${BASE_ANIME_URL}/status-count`
      );
      return response.data;
    } catch (error) {
      const message = handleAxiosError(error);
      throw new Error(message);
    }
  };

  const create = async (data: AnimeCreateRequest[]) => {
    try {
      const response = await interceptedAxios.post<number[]>(
        `${BASE_ANIME_URL}/bulk`,
        { data }
      );
      return response.data;
    } catch (error) {
      const message = handleAxiosError(error);
      throw new Error(message);
    }
  };

  const updateReview = async (id: number, data: AnimeReviewRequest) => {
    try {
      const response = await interceptedAxios.put<{ message?: string }>(
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
  ) => {
    try {
      const response = await interceptedAxios.put<{ message?: string }>(
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
    fetchAll,
    get,
    getDuplicates,
    getStatusCounts,
    fetchStatusCounts: getStatusCounts,
    create,
    updateReview,
    updateProgressStatus,
    remove
  };
};

const animeService = createAnimeService();

const fetchAnimeByIdService = async (
  id: number
): Promise<ServiceResult<AnimeDetail>> => {
  try {
    return { success: true, data: await animeService.get(id) };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};

const fetchAnimeDuplicate = async (
  id: number
): Promise<ServiceResult<{ exists: boolean }>> => {
  try {
    return { success: true, data: await animeService.getDuplicates(id) };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};

const addAnimeService = async (
  data: AnimeCreateRequest[]
): Promise<ServiceResult<number[]>> => {
  try {
    return { success: true, data: await animeService.create(data) };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};

const updateAnimeReviewService = async (
  id: number,
  data: AnimeReviewRequest
): Promise<ServiceResult<{ message?: string }>> => {
  try {
    return { success: true, data: await animeService.updateReview(id, data) };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};

const updateAnimeProgressStatusService = async (
  id: number,
  progressStatus: PROGRESS_STATUS
): Promise<ServiceResult<{ message?: string }>> => {
  try {
    return {
      success: true,
      data: await animeService.updateProgressStatus(id, progressStatus)
    };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};

const fetchStatusCounts = async (): Promise<ServiceResult<StatusFilter[]>> => {
  try {
    return { success: true, data: await animeService.getStatusCounts() };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};

export {
  animeService,
  fetchAnimeByIdService,
  fetchAnimeDuplicate,
  addAnimeService,
  updateAnimeReviewService,
  updateAnimeProgressStatusService,
  fetchStatusCounts
};
