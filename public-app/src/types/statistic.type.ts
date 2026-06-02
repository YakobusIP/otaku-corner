import { ProgressStatusKey } from "@/lib/enums";

type MediaConsumptionRow = {
  period: string;
  animeCount: number;
  mangaCount: number;
  lightNovelCount: number;
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

type RecentReviewItem = {
  mediaType: "anime" | "manga" | "lightNovel";
  mediaId: number;
  slug: string;
  title: string;
  images: unknown;
  personalScore: number | null;
  updatedAt: string;
};

type AllTimeCount = {
  allMediaCount: number;
  animeCount: number;
  mangaCount: number;
  lightNovelCount: number;
  averageMalScore: number;
  averagePersonalScore: number;
};

type TopMediaAndYearlyCount = {
  anime: {
    id: number | null;
    slug: string | null;
    count: number;
    images: {
      image_url: string;
      large_image_url?: string | null;
      small_image_url?: string | null;
    } | null;
    title: string | null;
    titleJapanese: string | null;
    score: number | null;
  };
  manga: {
    id: number | null;
    slug: string | null;
    count: number;
    images: {
      image_url: string;
      large_image_url?: string | null;
      small_image_url?: string | null;
    } | null;
    title: string | null;
    titleJapanese: string | null;
    score: number | null;
  };
  lightNovel: {
    id: number | null;
    slug: string | null;
    count: number;
    images: {
      image_url: string;
      large_image_url?: string | null;
      small_image_url?: string | null;
    } | null;
    title: string | null;
    titleJapanese: string | null;
    score: number | null;
  };
};

type StatusFilter = {
  label: string;
  value?: ProgressStatusKey;
  count: number;
  isAllTab?: boolean;
};

export type {
  AllTimeCount,
  TopMediaAndYearlyCount,
  StatusFilter,
  MediaConsumptionRow,
  TasteProfile,
  TasteProfileRow,
  RecentReviewItem
};
