import { MetadataResponse } from "@/types/api.type";
import type { PaginatedBody, PaginatedListPage, ServiceResult } from "@/types/general.type";

import interceptedAxios from "@/lib/axios";
import { ok, err } from "@/lib/service-result";

const BASE_GENRE_URL = "/api/genres";
const BASE_STUDIO_URL = "/api/studios";
const BASE_THEME_URL = "/api/themes";
const BASE_AUTHOR_URL = "/api/authors";

type EntityResponse = { id: number; name: string };

const createEntityService = (baseUrl: string) => {
  const fetchAll = async <T>(): Promise<ServiceResult<T[]>> => {
    try {
      const response = await interceptedAxios.get<PaginatedBody<T>>(baseUrl);
      return ok(response.data.data);
    } catch (error) {
      return err(error);
    }
  };

  const fetchAllWithMediaCount = async <T>(
    page?: number,
    limit?: number,
    query?: string
  ): Promise<ServiceResult<PaginatedListPage<T>>> => {
    try {
      const response = await interceptedAxios.get<PaginatedBody<T>>(baseUrl, {
        params: { page, limit, query }
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

  const addEntity = async (
    entity: string
  ): Promise<ServiceResult<EntityResponse>> => {
    try {
      const response = await interceptedAxios.post<EntityResponse>(baseUrl, {
        name: entity
      });
      return ok(response.data);
    } catch (error) {
      return err(error);
    }
  };

  const updateEntity = async (
    id: number,
    entity: string
  ): Promise<ServiceResult<EntityResponse>> => {
    try {
      const response = await interceptedAxios.put<EntityResponse>(
        `${baseUrl}/${id}`,
        { name: entity }
      );
      return ok(response.data);
    } catch (error) {
      return err(error);
    }
  };

  const deleteEntity = async (
    ids: number[]
  ): Promise<ServiceResult<undefined>> => {
    try {
      await interceptedAxios.delete(baseUrl, { data: { ids } });
      return ok(undefined);
    } catch (error) {
      return err(error);
    }
  };

  return {
    fetchAll,
    fetchAllWithMediaCount,
    addEntity,
    updateEntity,
    deleteEntity
  };
};

export const genreService = createEntityService(BASE_GENRE_URL);
export const studioService = createEntityService(BASE_STUDIO_URL);
export const themeService = createEntityService(BASE_THEME_URL);
export const authorService = createEntityService(BASE_AUTHOR_URL);
