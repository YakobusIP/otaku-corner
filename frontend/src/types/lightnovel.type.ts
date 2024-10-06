import { SORT_ORDER } from "@/lib/enums";
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
  illustrationRating?: number | null;
  enjoymentRating?: number | null;
  personalScore?: number | null;
};

type LightNovelDetail = Omit<
  LightNovelPostRequest,
  "authors" | "genres" | "themes"
> & {
  id: number;
  authors: AuthorEntityPartial[];
  genres: GenreEntityPartial[];
  themes: ThemeEntityPartial[];
};

type LightNovelList = {
  id: number;
  title: string;
  titleJapanese: string;
  status: string;
  images: {
    image_url: string;
    large_image_url?: string | null;
    small_image_url?: string | null;
  };
  score: number;
  personalScore: number | null;
};

type LightNovelReview = Pick<
  LightNovelPostRequest,
  | "review"
  | "storylineRating"
  | "worldBuildingRating"
  | "illustrationRating"
  | "enjoymentRating"
  | "personalScore"
>;

type LightNovelFilterSort = {
  sortBy: string;
  SORT_ORDER: SORT_ORDER;
  filterAuthor?: number;
  filterGenre?: number;
  filterTheme?: number;
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
