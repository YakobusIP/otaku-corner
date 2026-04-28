import {
  AuthorEntityPartial,
  GenreEntityPartial,
  ThemeEntityPartial
} from "@/types/entity.type";

import { PROGRESS_STATUS, SORT_ORDER } from "@/lib/enums";

type LightNovelEntity = {
  id: number;
  slug: string;
  status: string;
  title: string;
  titleJapanese: string;
  titleSynonyms: string;
  published: string;
  volumesCount?: number | null;
  score: number;
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
  review: LightNovelReview;
  volumeProgress: LightNovelVolumes[];
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
  progressStatus: PROGRESS_STATUS;
  personalScore?: number | null;
  createdAt: Date;
  updatedAt: Date;
};

type LightNovelVolumes = {
  id: number;
  volumeNumber: number;
  consumedAt?: Date | null;
};

type LightNovelCreateRequest = {
  id: number;
  status: string;
  title: string;
  titleJapanese: string;
  titleSynonyms: string;
  published: string;
  volumesCount?: number | null;
  score: number;
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
};

type LightNovelDetail = Omit<
  LightNovelEntity,
  "authors" | "genres" | "themes"
> & {
  authors: AuthorEntityPartial[];
  genres: GenreEntityPartial[];
  themes: ThemeEntityPartial[];
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
  | "volumeProgress"
  | "volumesCount"
> &
  Pick<LightNovelReview, "progressStatus" | "personalScore" | "reviewText">;

type LightNovelReviewRequest = Omit<
  LightNovelReview,
  "id" | "createdAt" | "updatedAt"
>;

type LightNovelFilterSort = {
  sortBy: string;
  sortOrder: SORT_ORDER;
  filterAuthor?: number;
  filterGenre?: number;
  filterTheme?: number;
  filterProgressStatus?: keyof typeof PROGRESS_STATUS;
  filterMALScore?: string;
  filterPersonalScore?: string;
  filterStatusCheck?: string;
};

export type {
  LightNovelCreateRequest,
  LightNovelDetail,
  LightNovelList,
  LightNovelReviewRequest,
  LightNovelFilterSort
};
