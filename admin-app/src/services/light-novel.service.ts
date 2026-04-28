import {
  ApiResponse,
  MessageResponse,
  MetadataResponse
} from "@/types/api.type";
import type {
  LightNovelCreateRequest,
  LightNovelDetail,
  LightNovelFilterSort,
  LightNovelList,
  LightNovelReviewRequest
} from "@/types/light-novel.type";
import type { PaginatedBody, PaginatedListPage, ServiceResult } from "@/types/general.type";

import interceptedAxios from "@/lib/axios";
import { ok, err } from "@/lib/service-result";
import { PROGRESS_STATUS } from "@/lib/enums";

const BASE_LIGHTNOVEL_URL = "/api/light-novels";

const createLightNovelService = () => {
  const list = async (
    params: LightNovelFilterSort & {
      page: number;
      limit: number;
      query?: string;
    }
  ): Promise<ServiceResult<PaginatedListPage<LightNovelList>>> => {
    try {
      const response = await interceptedAxios.get<
        PaginatedBody<LightNovelList>
      >(BASE_LIGHTNOVEL_URL, {
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
      });
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

  const get = async (id: number): Promise<ServiceResult<LightNovelDetail>> => {
    try {
      const response = await interceptedAxios.get<LightNovelDetail>(
        `${BASE_LIGHTNOVEL_URL}/${id}`
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
        `${BASE_LIGHTNOVEL_URL}/duplicate/${id}`
      );
      return ok(response.data);
    } catch (error) {
      return err(error);
    }
  };

  const create = async (
    data: LightNovelCreateRequest[]
  ): Promise<ServiceResult<number[]>> => {
    try {
      const response = await interceptedAxios.post<number[]>(
        `${BASE_LIGHTNOVEL_URL}/bulk`,
        { data }
      );
      return ok(response.data);
    } catch (error) {
      return err(error);
    }
  };

  const updateReview = async (
    id: number,
    data: LightNovelReviewRequest
  ): Promise<ServiceResult<MessageResponse>> => {
    try {
      const response = await interceptedAxios.put<{ message?: string }>(
        `${BASE_LIGHTNOVEL_URL}/${id}/review`,
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
        `${BASE_LIGHTNOVEL_URL}/${id}/review`,
        { progressStatus: data }
      );
      return ok({ message: response.data.message ?? "" });
    } catch (error) {
      return err(error);
    }
  };

  const updateVolumes = async (
    id: number,
    volumesCount: number
  ): Promise<ServiceResult<MessageResponse>> => {
    try {
      const response = await interceptedAxios.put<{ message?: string }>(
        `${BASE_LIGHTNOVEL_URL}/${id}`,
        { volumesCount }
      );
      return ok({ message: response.data.message ?? "" });
    } catch (error) {
      return err(error);
    }
  };

  const updateVolumeProgress = async (
    data: { id: number; consumedAt?: Date | null }[]
  ): Promise<ServiceResult<MessageResponse>> => {
    try {
      const response = await interceptedAxios.put<{ message?: string }>(
        `${BASE_LIGHTNOVEL_URL}/volume-progress`,
        { data }
      );
      return ok({ message: response.data.message ?? "" });
    } catch (error) {
      return err(error);
    }
  };

  const remove = async (ids: number[]): Promise<ServiceResult<undefined>> => {
    try {
      await interceptedAxios.delete<ApiResponse<void>>(BASE_LIGHTNOVEL_URL, {
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
    updateVolumes,
    updateVolumeProgress,
    remove
  };
};

export const lightNovelService = createLightNovelService();
