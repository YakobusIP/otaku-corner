import { ApiResponse } from "@/types/api.type";

import { axiosClient } from "@/lib/axios";

import { AxiosError } from "axios";

const BASE_GENRE_URL = "/api/genre";
const BASE_STUDIO_URL = "/api/studio";
const BASE_THEME_URL = "/api/theme";
const BASE_AUTHOR_URL = "/api/author";

const createEntityService = (baseUrl: string) => {
  const fetchAll = async <T>(): Promise<ApiResponse<T>> => {
    try {
      const response = await axiosClient.get(baseUrl);
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof AxiosError && error.response?.data.error
            ? error.response?.data.error
            : "There was a problem with your request."
      };
    }
  };

  return { fetchAll };
};

const genreService = createEntityService(BASE_GENRE_URL);
const studioService = createEntityService(BASE_STUDIO_URL);
const themeService = createEntityService(BASE_THEME_URL);
const authorService = createEntityService(BASE_AUTHOR_URL);

export { genreService, studioService, themeService, authorService };
