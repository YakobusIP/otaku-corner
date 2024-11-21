import {
  AuthorEntityPartial,
  GenreEntityPartial,
  ThemeEntityPartial
} from "@/types/entity.type";

import { PROGRESS_STATUS, SORT_ORDER } from "@/lib/enums";

type MangaEntity = {
  id: string;
  malId: number;
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
  id: string;
  review?: string | null;
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

type MangaDetail = Omit<MangaEntity, "authors" | "genres" | "themes"> & {
  id: string;
  authors: AuthorEntityPartial[];
  genres: GenreEntityPartial[];
  themes: ThemeEntityPartial[];
};

type MangaList = Pick<
  MangaEntity,
  | "id"
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
    "progressStatus" | "personalScore" | "review" | "consumedAt"
  >;

type MangaFilterSort = {
  sortBy: string;
  sortOrder: SORT_ORDER;
  filterAuthor?: string;
  filterGenre?: string;
  filterTheme?: string;
  filterMALScore?: string;
  filterPersonalScore?: string;
};

export type { MangaDetail, MangaList, MangaFilterSort };
