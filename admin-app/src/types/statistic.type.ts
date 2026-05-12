import type { MediaType } from "@/types/general.type";

import { ProgressStatusKey } from "@/lib/enums";

type MediaConsumption = {
  period: string;
  animeCount: number;
  mangaCount: number;
  lightNovelCount: number;
};

type DashboardKpiMetric = {
  value: number;
  previousValue: number;
  changePercent: number;
  changeAbsolute: number;
};

type DashboardKpis = {
  year: number | null;
  cutoffAt: string;
  priorCutoffAt: string;
  totalMedia: DashboardKpiMetric;
  inProgress: DashboardKpiMetric;
  averagePersonalScore: DashboardKpiMetric;
  topRatedPersonalScore: DashboardKpiMetric;
};

type TopRatedMediaRow = {
  id: number;
  slug: string;
  title: string;
  images: unknown;
  personalScore: number | null;
};

type TopRatedThisYear = {
  year: number | null;
  anime: TopRatedMediaRow | null;
  manga: TopRatedMediaRow | null;
  lightNovel: TopRatedMediaRow | null;
};

type LibraryHealthSegment = {
  status: string;
  count: number;
  percentage: number;
};

type LibraryHealth = {
  total: number;
  segments: LibraryHealthSegment[];
};

type RecentReviewItem = {
  mediaType: MediaType;
  mediaId: number;
  slug: string;
  title: string;
  images: unknown;
  personalScore: number | null;
  updatedAt: string;
};

type TasteProfileRow = {
  name: string;
  percentage: number;
  totalCount: number;
  animeCount?: number;
  mangaCount?: number;
  lightNovelCount?: number;
};

type TasteProfile = {
  genres: TasteProfileRow[];
  themes: TasteProfileRow[];
  studios: TasteProfileRow[];
  authors: TasteProfileRow[];
};

type StatusFilter = {
  label: string;
  value?: ProgressStatusKey;
  count: number;
};

export type {
  MediaConsumption,
  StatusFilter,
  DashboardKpis,
  TopRatedThisYear,
  LibraryHealth,
  RecentReviewItem,
  TasteProfileRow,
  TasteProfile
};
