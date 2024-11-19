import {
  AuthorEntityPartial,
  GenreEntityPartial,
  ThemeEntityPartial
} from "@/types/entity.type";

import { PROGRESS_STATUS, SORT_ORDER } from "@/lib/enums";

type LightNovelEntity = {
  id: string;
  malId: number;
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
  createdAt: Date;
  updatedAt: Date;
};

type LightNovelReview = {
  id: string;
  review?: string | null;
  storylineRating?: number | null;
  worldBuildingRating?: number | null;
  writingStyleRating?: number | null;
  charDevelopmentRating?: number | null;
  originalityRating?: number | null;
  progressStatus: PROGRESS_STATUS;
  personalScore?: number | null;
  consumedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type LightNovelDetail = Omit<
  LightNovelEntity,
  "authors" | "genres" | "themes"
> & {
  id: string;
  authors: AuthorEntityPartial[];
  genres: GenreEntityPartial[];
  themes: ThemeEntityPartial[];
};

type LightNovelList = Pick<
  LightNovelEntity,
  | "id"
  | "title"
  | "titleJapanese"
  | "status"
  | "images"
  | "score"
  | "volumesCount"
> &
  Pick<
    LightNovelReview,
    "progressStatus" | "personalScore" | "review" | "consumedAt"
  >;

type LightNovelFilterSort = {
  sortBy: string;
  sortOrder: SORT_ORDER;
  filterAuthor?: string;
  filterGenre?: string;
  filterTheme?: string;
  filterMALScore?: string;
  filterPersonalScore?: string;
};

export type { LightNovelDetail, LightNovelList, LightNovelFilterSort };
