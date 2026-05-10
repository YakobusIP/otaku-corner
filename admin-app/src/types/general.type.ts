import type { MetadataResponse } from "@/types/api.type";

type ScoreOption = {
  key: "poor" | "average" | "good" | "excellent";
  label: string;
  optionLabel: string;
  min: number;
  max: number;
};

type GenericKeyLabel = {
  key: string;
  label: string;
};

type ServiceResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

type PaginatedListPage<T> = {
  data: T[];
  metadata: MetadataResponse;
};

type PaginatedBody<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type MediaType = "anime" | "manga" | "lightNovel";

type FetchAllPagedOptions = {
  page?: number;
  limit?: number;
  query?: string;
  includeIds?: number[];
  connectedMedia?: boolean;
};

export type {
  ScoreOption,
  GenericKeyLabel,
  ServiceResult,
  PaginatedListPage,
  PaginatedBody,
  MediaType,
  FetchAllPagedOptions
};
