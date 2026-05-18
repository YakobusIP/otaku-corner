import { axiosClient, handleAxiosError } from "@/lib/axios";
import {
  type NestPaginatedListBody,
  mapNestListPageToPublic
} from "@/lib/nest-paginated-list";

const BASE_GENRE_URL = "/api/genres";
const BASE_STUDIO_URL = "/api/studios";
const BASE_THEME_URL = "/api/themes";
const BASE_AUTHOR_URL = "/api/authors";

const ENTITY_LIST_LIMIT = 5000;

const createEntityService = (baseUrl: string) => {
  const fetchAll = async <T>() => {
    try {
      const response = await axiosClient.get<NestPaginatedListBody<T>>(
        baseUrl,
        {
          params: { page: 1, limit: ENTITY_LIST_LIMIT }
        }
      );
      return mapNestListPageToPublic(response.data).data;
    } catch (error) {
      const message = handleAxiosError(error);
      throw new Error(message);
    }
  };

  return { fetchAll };
};

export const genreService = createEntityService(BASE_GENRE_URL);
export const studioService = createEntityService(BASE_STUDIO_URL);
export const themeService = createEntityService(BASE_THEME_URL);
export const authorService = createEntityService(BASE_AUTHOR_URL);
