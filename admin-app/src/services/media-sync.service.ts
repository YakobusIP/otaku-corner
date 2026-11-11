import type {
  MediaSyncItem,
  MediaSyncItemOutcome,
  MediaSyncRunDetail,
  PaginatedMediaSyncRuns,
  PaginatedOpenMediaSyncConflicts
} from "@/types/media-sync.type";
import type {
  MediaSyncConflictActionRequest,
  ResolveMediaSyncFieldsRequest
} from "@/types/media-sync-resolve.type";
import type { ServiceResult } from "@/types/general.type";

import interceptedAxios from "@/lib/axios";
import { err, ok } from "@/lib/service-result";

const RUNS_URL = "/api/media-sync-runs";
const ITEMS_URL = "/api/media-sync-items";

export const mediaSyncService = {
  async listRuns(params: {
    page?: number;
    limit?: number;
  }): Promise<ServiceResult<PaginatedMediaSyncRuns>> {
    try {
      const response = await interceptedAxios.get<PaginatedMediaSyncRuns>(
        RUNS_URL,
        { params }
      );
      return ok(response.data);
    } catch (error) {
      return err(error);
    }
  },

  async getRunDetail(
    id: string,
    params: { page?: number; limit?: number; outcome?: MediaSyncItemOutcome } = {}
  ): Promise<ServiceResult<MediaSyncRunDetail>> {
    try {
      const response = await interceptedAxios.get<MediaSyncRunDetail>(
        `${RUNS_URL}/${id}`,
        { params }
      );
      return ok(response.data);
    } catch (error) {
      return err(error);
    }
  },

  async listOpenConflicts(params: {
    page?: number;
    limit?: number;
  }): Promise<ServiceResult<PaginatedOpenMediaSyncConflicts>> {
    try {
      const response =
        await interceptedAxios.get<PaginatedOpenMediaSyncConflicts>(
          `${ITEMS_URL}/open-conflicts`,
          { params }
        );
      return ok(response.data);
    } catch (error) {
      return err(error);
    }
  },

  async acceptUpstream(
    itemId: string,
    body: MediaSyncConflictActionRequest
  ): Promise<ServiceResult<MediaSyncItem>> {
    try {
      const response = await interceptedAxios.post<MediaSyncItem>(
        `${ITEMS_URL}/${itemId}/accept-upstream`,
        body
      );
      return ok(response.data);
    } catch (error) {
      return err(error);
    }
  },

  async keepExisting(
    itemId: string,
    body: MediaSyncConflictActionRequest
  ): Promise<ServiceResult<MediaSyncItem>> {
    try {
      const response = await interceptedAxios.post<MediaSyncItem>(
        `${ITEMS_URL}/${itemId}/keep-existing`,
        body
      );
      return ok(response.data);
    } catch (error) {
      return err(error);
    }
  },

  async resolveFields(
    itemId: string,
    body: ResolveMediaSyncFieldsRequest
  ): Promise<ServiceResult<MediaSyncItem>> {
    try {
      const response = await interceptedAxios.post<MediaSyncItem>(
        `${ITEMS_URL}/${itemId}/resolve-fields`,
        body
      );
      return ok(response.data);
    } catch (error) {
      return err(error);
    }
  }
};
