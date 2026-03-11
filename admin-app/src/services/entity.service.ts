import {
  ApiResponse,
  ApiResponseList,
  MessageResponse
} from "@/types/api.type";

import interceptedAxios, { handleAxiosError } from "@/lib/axios";

const BASE_GENRE_URL = "/api/genre";
const BASE_STUDIO_URL = "/api/studio";
const BASE_THEME_URL = "/api/theme";
const BASE_AUTHOR_URL = "/api/author";

const createEntityService = (baseUrl: string) => {
  const fetchAll = async <T>() => {
    try {
      const response = await interceptedAxios.get<ApiResponse<T>>(baseUrl);
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
      const response = await interceptedAxios.get<ApiResponseList<T>>(baseUrl, {
        params: { connected_media: true, page, limit, q: query }
      });
      return response.data.data;
    } catch (error) {
      const message = handleAxiosError(error);
      throw new Error(message);
    }
  };

  const create = async (entity: string) => {
    try {
      const response = await interceptedAxios.post<
        ApiResponse<MessageResponse>
      >(baseUrl, { name: entity });
      return response.data;
    } catch (error) {
      const message = handleAxiosError(error);
      throw new Error(message);
    }
  };

  const update = async (id: number, entity: string) => {
    try {
      const response = await interceptedAxios.put<ApiResponse<MessageResponse>>(
        `${baseUrl}/${id}`,
        {
          name: entity
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
      await interceptedAxios.delete<ApiResponse<void>>(baseUrl, {
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
    fetchAllWithMediaCount,
    create,
    update,
    remove
  };
};

const genreService = createEntityService(BASE_GENRE_URL);
const studioService = createEntityService(BASE_STUDIO_URL);
const themeService = createEntityService(BASE_THEME_URL);
const authorService = createEntityService(BASE_AUTHOR_URL);

export { genreService, studioService, themeService, authorService };
