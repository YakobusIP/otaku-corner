import { ProgressStatusKey } from "@/lib/enums";

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
    id: number;
    slug: string;
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
    id: number;
    slug: string;
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
    id: number;
    slug: string;
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
};

export type { AllTimeCount, TopMediaAndYearlyCount, StatusFilter };
