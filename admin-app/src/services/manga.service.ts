import { ApiResponse, MessageResponse } from "@/types/api.type";
import type {
  FetchAllPagedOptions,
  PaginatedBody,
  PaginatedListPage,
  ServiceResult
} from "@/types/general.type";
import type {
  MangaCreateRequest,
  MangaDetail,
  MangaFilterSort,
  MangaList,
  MangaReviewRequest
} from "@/types/manga.type";

import interceptedAxios from "@/lib/axios";
import { PROGRESS_STATUS } from "@/lib/enums";
import { err, ok } from "@/lib/service-result";
import { mapPaginatedBody } from "@/lib/utils";

const BASE_MANGA_URL = "/api/mangas";

const createMangaService = () => {
  const list = async (
    params: MangaFilterSort & FetchAllPagedOptions
  ): Promise<ServiceResult<PaginatedListPage<MangaList>>> => {
    try {
      const response = await interceptedAxios.get<PaginatedBody<MangaList>>(
        BASE_MANGA_URL,
        {
          params: {
            page: params.page,
            limit: params.limit,
            query: params.query,
            include_ids: params.includeIds?.length
              ? params.includeIds.join(",")
              : undefined,
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
      return ok(mapPaginatedBody(response.data));
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
      await interceptedAxios.put(`${BASE_MANGA_URL}/${id}/review`, data);
      return ok({ message: "Review saved successfully" });
    } catch (error) {
      return err(error);
    }
  };

  const updateProgressStatus = async (
    id: number,
    data: PROGRESS_STATUS
  ): Promise<ServiceResult<MessageResponse>> => {
    try {
      await interceptedAxios.put(`${BASE_MANGA_URL}/${id}/review`, {
        progressStatus: data
      });
      return ok({ message: "Progress status updated successfully" });
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
      await interceptedAxios.put(`${BASE_MANGA_URL}/${id}`, {
        chaptersCount,
        volumesCount
      });
      return ok({ message: "Chapters and volumes updated successfully" });
    } catch (error) {
      return err(error);
    }
  };

  const enqueueMetadataSync = async (
    id: number
  ): Promise<ServiceResult<{ queued: true }>> => {
    try {
      const response = await interceptedAxios.post<{ queued: true }>(
        `${BASE_MANGA_URL}/${id}/metadata-sync`
      );
      return ok(response.data);
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
    enqueueMetadataSync,
    remove
  };
};

export const mangaService = createMangaService();
