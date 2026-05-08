import interceptedAxios from "@/lib/axios";
import { mapPaginatedBody } from "@/lib/utils";
import { err, ok } from "@/lib/service-result";
import type {
  FetchAllPagedOptions,
  PaginatedBody,
  PaginatedListPage,
  ServiceResult
} from "@/types/general.type";

const BASE_GENRE_URL = "/api/genres";
const BASE_STUDIO_URL = "/api/studios";
const BASE_THEME_URL = "/api/themes";
const BASE_AUTHOR_URL = "/api/authors";

type EntityResponse = { id: number; name: string };

const createEntityService = (baseUrl: string) => {
  const fetchAll = async <T>(
    opts?: FetchAllPagedOptions
  ): Promise<ServiceResult<PaginatedListPage<T>>> => {
    try {
      const params = {
        page: opts?.page,
        limit: opts?.limit,
        query: opts?.query,
        include_ids: opts?.includeIds?.length
          ? opts.includeIds.join(",")
          : undefined
      };
      const response = await interceptedAxios.get<PaginatedBody<T>>(baseUrl, {
        params
      });
      return ok(mapPaginatedBody(response.data));
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
    addEntity,
    updateEntity,
    deleteEntity
  };
};

export const genreService = createEntityService(BASE_GENRE_URL);
export const studioService = createEntityService(BASE_STUDIO_URL);
export const themeService = createEntityService(BASE_THEME_URL);
export const authorService = createEntityService(BASE_AUTHOR_URL);
