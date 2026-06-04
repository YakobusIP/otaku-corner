import { MangaDetail, MangaList, MangaSitemap } from "@/types/manga.type";
import { StatusFilter } from "@/types/statistic.type";

import { axiosClient, handleAxiosError } from "@/lib/api/axios";
import { PROGRESS_STATUS, SORT_ORDER } from "@/lib/shared/enums";
import {
  type NestPaginatedListBody,
  mapNestListPageToPublic
} from "@/lib/shared/nest-paginated-list";

const BASE_MANGA_URL = "/api/mangas";

const createMangaService = () => {
  const fetchAll = async (
    page: number,
    limit: number,
    query?: string,
    sort?: string,
    order?: SORT_ORDER,
    author?: number,
    genre?: number,
    theme?: number,
    status?: keyof typeof PROGRESS_STATUS,
    malScore?: string,
    personalScore?: string
  ) => {
    try {
      const response = await axiosClient.get<NestPaginatedListBody<MangaList>>(
        BASE_MANGA_URL,
        {
          params: {
            page,
            limit,
            query,
            sort,
            order,
            author,
            genre,
            theme,
            status,
            malScore,
            personalScore
          }
        }
      );
      return mapNestListPageToPublic(response.data);
    } catch (error) {
      const message = handleAxiosError(error);
      throw new Error(message);
    }
  };

  const fetchById = async (id: number) => {
    try {
      const response = await axiosClient.get<MangaDetail>(
        `${BASE_MANGA_URL}/${id}`
      );
      return response.data;
    } catch (error) {
      const message = handleAxiosError(error);
      throw new Error(message);
    }
  };

  const fetchTotalCount = async () => {
    try {
      const response = await axiosClient.get<{ count: number }>(
        `${BASE_MANGA_URL}/total`
      );
      return response.data;
    } catch (error) {
      const message = handleAxiosError(error);
      throw new Error(message);
    }
  };

  const fetchSitemap = async (page: number, limit: number) => {
    try {
      const response = await axiosClient.get<MangaSitemap[]>(
        `${BASE_MANGA_URL}/sitemap`,
        {
          params: { page, limit }
        }
      );
      return response.data;
    } catch (error) {
      const message = handleAxiosError(error);
      throw new Error(message);
    }
  };

  const fetchStatusCounts = async () => {
    try {
      const response = await axiosClient.get<
        { label: string; value: string | null; count: number }[]
      >(`${BASE_MANGA_URL}/status-count`);
      return response.data.map(
        (row): StatusFilter => ({
          label: row.label,
          count: row.count,
          ...(row.value !== null && row.value !== undefined
            ? { value: row.value as StatusFilter["value"] }
            : {})
        })
      );
    } catch (error) {
      const message = handleAxiosError(error);
      throw new Error(message);
    }
  };

  return {
    fetchAll,
    fetchById,
    fetchTotalCount,
    fetchSitemap,
    fetchStatusCounts
  };
};

export const mangaService = createMangaService();
