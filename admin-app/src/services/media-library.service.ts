import type { MetadataResponse } from "@/types/api.type";
import {
  type PaginatedBody,
  type PaginatedListPage,
  type ServiceResult
} from "@/types/general.type";
import type {
  MediaLibraryListItem,
  MediaLibraryListRequest
} from "@/types/media-library.type";

import interceptedAxios from "@/lib/axios";
import { err, ok } from "@/lib/service-result";

const BASE_URL = "/api/media-library";

const createMediaLibraryService = () => {
  const list = async (
    params: MediaLibraryListRequest
  ): Promise<ServiceResult<PaginatedListPage<MediaLibraryListItem>>> => {
    try {
      const response = await interceptedAxios.get<
        PaginatedBody<MediaLibraryListItem>
      >(BASE_URL, {
        params: {
          page: params.page,
          limit: params.limit,
          query: params.filterQuery,
          sort: params.sortBy,
          order: params.sortOrder,
          status: params.filterProgressStatus,
          genre: params.filterGenre,
          studio: params.filterStudio,
          theme: params.filterTheme,
          author: params.filterAuthor,
          type: params.filterType,
          malScore: params.filterMALScore,
          personalScore: params.filterPersonalScore,
          statusCheck: params.filterStatusCheck
        }
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

  return { list } as const;
};

export const mediaLibraryService = createMediaLibraryService();
