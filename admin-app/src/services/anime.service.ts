import {
  AnimeCreateRequest,
  AnimeDetail,
  AnimeFilterSort,
  AnimeList,
  AnimeReviewRequest
} from "@/types/anime.type";
import { ApiResponse, MessageResponse } from "@/types/api.type";
import type {
  FetchAllPagedOptions,
  PaginatedBody,
  PaginatedListPage,
  ServiceResult
} from "@/types/general.type";
import { StatusFilter } from "@/types/statistic.type";

import interceptedAxios from "@/lib/axios";
import { PROGRESS_STATUS } from "@/lib/enums";
import { err, ok } from "@/lib/service-result";
import { mapPaginatedBody } from "@/lib/utils";

const BASE_ANIME_URL = "/api/animes";

const createAnimeService = () => {
  const list = async (
    params: AnimeFilterSort & FetchAllPagedOptions
  ): Promise<ServiceResult<PaginatedListPage<AnimeList>>> => {
    try {
      const response = await interceptedAxios.get<PaginatedBody<AnimeList>>(
        BASE_ANIME_URL,
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
            genre: params.filterGenre,
            studio: params.filterStudio,
            theme: params.filterTheme,
            status: params.filterProgressStatus,
            malScore: params.filterMALScore,
            personalScore: params.filterPersonalScore,
            type: params.filterType,
            statusCheck: params.filterStatusCheck
          }
        }
      );
      return ok(mapPaginatedBody(response.data));
    } catch (error) {
      return err(error);
    }
  };

  const get = async (id: number): Promise<ServiceResult<AnimeDetail>> => {
    try {
      const response = await interceptedAxios.get<AnimeDetail>(
        `${BASE_ANIME_URL}/${id}`
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
        `${BASE_ANIME_URL}/duplicate/${id}`
      );
      return ok(response.data);
    } catch (error) {
      return err(error);
    }
  };

  const getStatusCounts = async (): Promise<ServiceResult<StatusFilter[]>> => {
    try {
      const response = await interceptedAxios.get<StatusFilter[]>(
        `${BASE_ANIME_URL}/status-count`
      );
      return ok(response.data);
    } catch (error) {
      return err(error);
    }
  };

  const create = async (
    data: AnimeCreateRequest[]
  ): Promise<ServiceResult<number[]>> => {
    try {
      const response = await interceptedAxios.post<number[]>(
        `${BASE_ANIME_URL}/bulk`,
        { data }
      );
      return ok(response.data);
    } catch (error) {
      return err(error);
    }
  };

  const updateReview = async (
    id: number,
    data: AnimeReviewRequest
  ): Promise<ServiceResult<MessageResponse>> => {
    try {
      const response = await interceptedAxios.put<{ message?: string }>(
        `${BASE_ANIME_URL}/${id}/review`,
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
        `${BASE_ANIME_URL}/${id}/review`,
        { progressStatus: data }
      );
      return ok({ message: response.data.message ?? "" });
    } catch (error) {
      return err(error);
    }
  };

  const remove = async (ids: number[]): Promise<ServiceResult<undefined>> => {
    try {
      await interceptedAxios.delete<ApiResponse<void>>(BASE_ANIME_URL, {
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
    getStatusCounts,
    create,
    updateReview,
    updateProgressStatus,
    remove
  };
};

export const animeService = createAnimeService();
