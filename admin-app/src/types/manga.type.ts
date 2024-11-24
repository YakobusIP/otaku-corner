import {
  AuthorEntityPartial,
  GenreEntityPartial,
  ThemeEntityPartial
} from "@/types/entity.type";

import { PROGRESS_STATUS, SORT_ORDER } from "@/lib/enums";

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
  review: MangaReview;
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
  progressStatus: PROGRESS_STATUS;
  personalScore?: number | null;
  consumedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type MangaCreateRequest = {
  id: number;
  status: string;
  title: string;
  titleJapanese: string;
  titleSynonyms: string;
  published: string;
  chaptersCount?: number | null;
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

type MangaDetail = Omit<MangaEntity, "authors" | "genres" | "themes"> & {
  authors: AuthorEntityPartial[];
  genres: GenreEntityPartial[];
  themes: ThemeEntityPartial[];
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
  Pick<
    MangaReview,
    "progressStatus" | "personalScore" | "reviewText" | "consumedAt"
  >;

type MangaReviewRequest = Omit<MangaReview, "id" | "createdAt" | "updatedAt">;

type MangaFilterSort = {
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
  MangaCreateRequest,
  MangaDetail,
  MangaList,
  MangaReviewRequest,
  MangaFilterSort
};
