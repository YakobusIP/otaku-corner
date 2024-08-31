import { ApiResponse } from "@/types/api.type";
import { GenreEntity, StudioEntity, ThemeEntity } from "@/types/entity.type";
import axios, { AxiosError } from "axios";

const BASE_GENRE_URL = "/api/genre";
const BASE_STUDIO_URL = "/api/studio";
const BASE_THEME_URL = "/api/theme";

const fetchAllGenreService = async (): Promise<ApiResponse<GenreEntity[]>> => {
  try {
    const response = await axios.get(BASE_GENRE_URL);
    return { success: true, data: response.data.data };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof AxiosError &&
        error.response?.data.error instanceof String
          ? error.response?.data.error
          : "There was a problem with your request."
    };
  }
};

const fetchAllStudioService = async (): Promise<
  ApiResponse<StudioEntity[]>
> => {
  try {
    const response = await axios.get(BASE_STUDIO_URL);
    return { success: true, data: response.data.data };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof AxiosError &&
        error.response?.data.error instanceof String
          ? error.response?.data.error
          : "There was a problem with your request."
    };
  }
};

const fetchAllThemeService = async (): Promise<ApiResponse<ThemeEntity[]>> => {
  try {
    const response = await axios.get(BASE_THEME_URL);
    return { success: true, data: response.data.data };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof AxiosError &&
        error.response?.data.error instanceof String
          ? error.response?.data.error
          : "There was a problem with your request."
    };
  }
};

export { fetchAllGenreService, fetchAllStudioService, fetchAllThemeService };
