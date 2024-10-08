import { PROGRESS_STATUS, SORT_ORDER } from "@/lib/enums";
import {
  AuthorEntityPartial,
  GenreEntityPartial,
  ThemeEntityPartial
} from "@/types/entity.type";

type LightNovelPostRequest = {
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
  review?: string | null;
  storylineRating?: number | null;
  worldBuildingRating?: number | null;
  writingStyleRating?: number | null;
  charDevelopmentRating?: number | null;
  originalityRating?: number | null;
  progressStatus: PROGRESS_STATUS;
  personalScore?: number | null;
};

type LightNovelDetail = Omit<
  LightNovelPostRequest,
  "authors" | "genres" | "themes"
> & {
  id: string;
  authors: AuthorEntityPartial[];
  genres: GenreEntityPartial[];
  themes: ThemeEntityPartial[];
};

type LightNovelList = {
  id: string;
  title: string;
  titleJapanese: string;
  status: string;
  images: {
    image_url: string;
    large_image_url?: string | null;
    small_image_url?: string | null;
  };
  score: number;
  progressStatus: PROGRESS_STATUS;
  personalScore: number | null;
};

type LightNovelReview = Pick<
  LightNovelPostRequest,
  | "review"
  | "progressStatus"
  | "storylineRating"
  | "worldBuildingRating"
  | "writingStyleRating"
  | "charDevelopmentRating"
  | "originalityRating"
  | "personalScore"
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

export type {
  LightNovelPostRequest,
  LightNovelDetail,
  LightNovelList,
  LightNovelReview,
  LightNovelFilterSort
};
