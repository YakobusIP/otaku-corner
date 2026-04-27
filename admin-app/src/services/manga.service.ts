import {
  ApiResponse,
  MessageResponse,
  MetadataResponse
} from "@/types/api.type";
import type {
  MangaCreateRequest,
  MangaDetail,
  MangaFilterSort,
  MangaList,
  MangaReviewRequest
} from "@/types/manga.type";
import type { PaginatedBody, PaginatedListPage, ServiceResult } from "@/types/general.type";

import interceptedAxios from "@/lib/axios";
import { ok, err } from "@/lib/service-result";
import { PROGRESS_STATUS } from "@/lib/enums";

const BASE_MANGA_URL = "/api/mangas";

const createMangaService = () => {
  const list = async (
    params: MangaFilterSort & {
      page: number;
      limit: number;
      query?: string;
    }
  ): Promise<ServiceResult<PaginatedListPage<MangaList>>> => {
    try {
      const response = await interceptedAxios.get<PaginatedBody<MangaList>>(
        BASE_MANGA_URL,
        {
          params: {
            page: params.page,
            limit: params.limit,
            query: params.query,
            sort: params.sortBy,
            order: params.sortOrder,
            author: params.filterAuthor,
            genre: params.filterGenre,
            theme: params.filterTheme,
            status: params.filterProgressStatus,
            malScore: params.filterMALScore,
            personalScore: params.filterPersonalScore,
            statusCheck: params.filterStatusCheck
          }
        }
      );
      const body = response.data;
      return ok({
        data: body.data,
        metadata: {
          page: body.page,
          limit: body.limit,
          pageCount: body.totalPages,
          itemCount: body.total
        } satisfies MetadataResponse
      });
    } catch (error) {
      return err(error);
    }
  };

  const get = async (id: number): Promise<ServiceResult<MangaDetail>> => {
    try {
      const response = await interceptedAxios.get<MangaDetail>(
        `${BASE_MANGA_URL}/${id}`
      );
      return ok(response.data);
    } catch (error) {
      return err(error);
    }
  };

  const getDuplicates = async (
    id: number
  ): Promise<ServiceResult<{ exists: boolean }>> => {
    try {
      const response = await interceptedAxios.get<{ exists: boolean }>(
        `${BASE_MANGA_URL}/duplicate/${id}`
      );
      return ok(response.data);
    } catch (error) {
      return err(error);
    }
  };

  const create = async (
    data: MangaCreateRequest[]
  ): Promise<ServiceResult<number[]>> => {
    try {
      const response = await interceptedAxios.post<number[]>(
        `${BASE_MANGA_URL}/bulk`,
        { data }
      );
      return ok(response.data);
    } catch (error) {
      return err(error);
    }
  };

  const updateReview = async (
    id: number,
    data: MangaReviewRequest
  ): Promise<ServiceResult<MessageResponse>> => {
    try {
      const response = await interceptedAxios.put<{ message?: string }>(
        `${BASE_MANGA_URL}/${id}/review`,
        data
      );
      return ok({ message: response.data.message ?? "" });
    } catch (error) {
      return err(error);
    }
  };

  const updateProgressStatus = async (
    id: number,
    data: PROGRESS_STATUS
  ): Promise<ServiceResult<MessageResponse>> => {
    try {
      const response = await interceptedAxios.put<{ message?: string }>(
        `${BASE_MANGA_URL}/${id}/review`,
        { progressStatus: data }
      );
      return ok({ message: response.data.message ?? "" });
    } catch (error) {
      return err(error);
    }
  };

  const updateVolumeAndChapters = async (
    id: number,
    chaptersCount: number,
    volumesCount: number
  ): Promise<ServiceResult<MessageResponse>> => {
    try {
      const response = await interceptedAxios.put<{ message?: string }>(
        `${BASE_MANGA_URL}/${id}`,
        {
          chaptersCount,
          volumesCount
        }
      );
      return ok({ message: response.data.message ?? "" });
    } catch (error) {
      return err(error);
    }
  };

  const remove = async (ids: number[]): Promise<ServiceResult<undefined>> => {
    try {
      await interceptedAxios.delete<ApiResponse<void>>(BASE_MANGA_URL, {
        data: { ids }
      });
      return ok(undefined);
    } catch (error) {
      return err(error);
    }
  };

  return {
    list,
    get,
    getDuplicates,
    create,
    updateReview,
    updateProgressStatus,
    updateVolumeAndChapters,
    remove
  };
};

export const mangaService = createMangaService();
