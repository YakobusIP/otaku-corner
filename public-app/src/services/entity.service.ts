import { ApiResponse } from "@/types/api.type";

import { axiosClient, handleAxiosError } from "@/lib/axios";

const BASE_GENRE_URL = "/api/genre";
const BASE_STUDIO_URL = "/api/studio";
const BASE_THEME_URL = "/api/theme";
const BASE_AUTHOR_URL = "/api/author";

const createEntityService = (baseUrl: string) => {
  const fetchAll = async <T>() => {
    try {
      const response = await axiosClient.get<ApiResponse<T>>(baseUrl);
      return response.data.data;
    } catch (error) {
      const message = handleAxiosError(error);
      throw new Error(message);
    }
  };

  return { fetchAll };
};

const genreService = createEntityService(BASE_GENRE_URL);
const studioService = createEntityService(BASE_STUDIO_URL);
const themeService = createEntityService(BASE_THEME_URL);
const authorService = createEntityService(BASE_AUTHOR_URL);

export { genreService, studioService, themeService, authorService };
