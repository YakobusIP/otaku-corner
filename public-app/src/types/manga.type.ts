import {
  AuthorEntityPartial,
  GenreEntityPartial,
  ThemeEntityPartial
} from "@/types/entity.type";

import { PROGRESS_STATUS, type ProgressStatusKey } from "@/lib/shared/enums";

type MangaEntity = {
  id: number;
  slug: string;
  status: string;
  title: string;
  titleJapanese: string;
  titleSynonyms: string;
  published: string;
  chaptersCount?: number | null;
  volumesCount?: number | null;
  score: number | null;
  images: {
    image_url: string;
    large_image_url?: string | null;
    small_image_url?: string | null;
  };
  authors: string[];
  genres: string[];
  themes: string[];
  synopsis: string;
  malUrl: string;
  review: MangaReview | null;
  createdAt: Date;
  updatedAt: Date;
};

type MangaReview = {
  id: number;
  reviewText?: string | null;
  storylineRating?: number | null;
  artStyleRating?: number | null;
  charDevelopmentRating?: number | null;
  worldBuildingRating?: number | null;
  originalityRating?: number | null;
  progressStatus: ProgressStatusKey | PROGRESS_STATUS;
  personalScore?: number | null;
  consumedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type MangaDetail = Omit<MangaEntity, "authors" | "genres" | "themes"> & {
  authors: AuthorEntityPartial[];
  genres: GenreEntityPartial[];
  themes: ThemeEntityPartial[];
};

type MangaListReviewFields = {
  progressStatus?: ProgressStatusKey | PROGRESS_STATUS | null;
  personalScore?: number | null;
  reviewText?: string | null;
  consumedAt?: Date | null;
};

type MangaList = Pick<
  MangaEntity,
  | "id"
  | "slug"
  | "title"
  | "titleJapanese"
  | "status"
  | "images"
  | "score"
  | "chaptersCount"
  | "volumesCount"
> &
  MangaListReviewFields;

type MangaSitemap = Pick<MangaEntity, "id" | "slug"> & {
  createdAt: Date;
  updatedAt: Date;
};

type MangaFilters = {
  author?: number;
  genre?: number;
  theme?: number;
  malScore?: string;
  personalScore?: string;
};

export type { MangaDetail, MangaFilters, MangaList, MangaSitemap };
