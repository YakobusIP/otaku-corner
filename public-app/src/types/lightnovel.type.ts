import {
  AuthorEntityPartial,
  GenreEntityPartial,
  ThemeEntityPartial
} from "@/types/entity.type";

import { PROGRESS_STATUS, type ProgressStatusKey } from "@/lib/enums";

type LightNovelEntity = {
  id: number;
  slug: string;
  status: string;
  title: string;
  titleJapanese: string;
  titleSynonyms: string;
  published: string;
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
  review: LightNovelReview | null;
  createdAt: Date;
  updatedAt: Date;
};

type LightNovelReview = {
  id: number;
  reviewText?: string | null;
  storylineRating?: number | null;
  worldBuildingRating?: number | null;
  writingStyleRating?: number | null;
  charDevelopmentRating?: number | null;
  originalityRating?: number | null;
  progressStatus: ProgressStatusKey | PROGRESS_STATUS;
  personalScore?: number | null;
  consumedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type LightNovelDetail = Omit<
  LightNovelEntity,
  "authors" | "genres" | "themes"
> & {
  authors: AuthorEntityPartial[];
  genres: GenreEntityPartial[];
  themes: ThemeEntityPartial[];
};

type LightNovelListReviewFields = {
  progressStatus?: ProgressStatusKey | PROGRESS_STATUS | null;
  personalScore?: number | null;
  reviewText?: string | null;
  consumedAt?: Date | null;
};

type LightNovelList = Pick<
  LightNovelEntity,
  | "id"
  | "slug"
  | "title"
  | "titleJapanese"
  | "status"
  | "images"
  | "score"
  | "volumesCount"
> &
  LightNovelListReviewFields;

type LightNovelSitemap = Pick<LightNovelEntity, "id" | "slug"> & {
  createdAt: Date;
  updatedAt: Date;
};

export type { LightNovelDetail, LightNovelList, LightNovelSitemap };
