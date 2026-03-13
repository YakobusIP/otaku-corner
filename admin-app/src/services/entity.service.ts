import { MetadataResponse } from "@/types/api.type";

import interceptedAxios, { handleAxiosError } from "@/lib/axios";

const BASE_GENRE_URL = "/api/genres";
const BASE_STUDIO_URL = "/api/studios";
const BASE_THEME_URL = "/api/themes";
const BASE_AUTHOR_URL = "/api/authors";
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

type EntityResponse = { id: number; name: string };

const createEntityService = (baseUrl: string) => {
  const fetchAll = async <T>() => {
    try {
      const response = await interceptedAxios.get<PaginatedBody<T>>(baseUrl);
      return response.data.data;
    } catch (error) {
      const message = handleAxiosError(error);
      throw new Error(message);
    }
  };

  const fetchAllWithMediaCount = async <T>(
    page?: number,
    limit?: number,
    query?: string
  ) => {
    try {
      const response = await interceptedAxios.get<PaginatedBody<T>>(baseUrl, {
        params: { page, limit, query }
      });
      const body = response.data;
      return {
        success: true,
        data: {
          data: body.data,
          metadata: {
            page: body.page,
            limit: body.limit,
            pageCount: body.totalPages,
            itemCount: body.total
          } satisfies MetadataResponse
        }
      } as const;
    } catch (error) {
      return { success: false, error: handleAxiosError(error) } as const;
    }
  };

  const addEntity = async (
    entity: string
  ): Promise<ServiceResult<EntityResponse>> => {
    try {
      const response = await interceptedAxios.post<EntityResponse>(baseUrl, {
        name: entity
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: handleAxiosError(error) };
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
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: handleAxiosError(error) };
    }
  };

  const deleteEntity = async (ids: number[]): Promise<ServiceResult<void>> => {
    try {
      await interceptedAxios.delete(baseUrl, { data: { ids } });
      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: handleAxiosError(error) };
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

const genreService = createEntityService(BASE_GENRE_URL);
const studioService = createEntityService(BASE_STUDIO_URL);
const themeService = createEntityService(BASE_THEME_URL);
const authorService = createEntityService(BASE_AUTHOR_URL);

export { genreService, studioService, themeService, authorService };
