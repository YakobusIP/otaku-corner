import { PROGRESS_STATUS, SORT_ORDER } from "@/lib/enums";
import {
  AuthorEntityPartial,
  GenreEntityPartial,
  ThemeEntityPartial
} from "@/types/entity.type";

type MangaPostRequest = {
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
  artStyleRating?: number | null;
  charDevelopmentRating?: number | null;
  worldBuildingRating?: number | null;
  originalityRating?: number | null;
  progressStatus?: PROGRESS_STATUS;
  personalScore?: number | null;
  consumedAt: Date | null;
};

type MangaDetail = Omit<MangaPostRequest, "authors" | "genres" | "themes"> & {
  id: string;
  authors: AuthorEntityPartial[];
  genres: GenreEntityPartial[];
  themes: ThemeEntityPartial[];
};

type MangaList = {
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

type MangaReview = Pick<
  MangaPostRequest,
  | "review"
  | "consumedAt"
  | "progressStatus"
  | "storylineRating"
  | "artStyleRating"
  | "charDevelopmentRating"
  | "worldBuildingRating"
  | "originalityRating"
  | "personalScore"
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

export type {
  MangaPostRequest,
  MangaDetail,
  MangaList,
  MangaReview,
  MangaFilterSort
};
