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

export type {
  ScoreOption,
  GenericKeyLabel,
  ServiceResult,
  PaginatedListPage,
  PaginatedBody,
  MediaType
};
