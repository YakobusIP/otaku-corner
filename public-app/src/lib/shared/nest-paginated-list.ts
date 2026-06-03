import type { MetadataResponse } from "@/types/api.type";

export type NestPaginatedListBody<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export const mapNestListPageToPublic = <T>(
  nest: NestPaginatedListBody<T>
): { data: T[]; metadata: MetadataResponse } => ({
  data: nest.data,
  metadata: {
    page: nest.page,
    limit: nest.limit,
    pageCount: nest.totalPages,
    itemCount: nest.total
  }
});
