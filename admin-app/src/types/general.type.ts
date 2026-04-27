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

export type ServiceResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export type PaginatedListPage<T> = {
  data: T[];
  metadata: MetadataResponse;
};

export type PaginatedBody<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type { ScoreOption, GenericKeyLabel };
