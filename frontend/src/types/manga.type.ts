import { SortOrder } from "@/enum/general.enum";
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
  qualityRating?: number | null;
  enjoymentRating?: number | null;
  personalScore?: number | null;
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
  personalScore: number | null;
};

type MangaReview = Pick<
  MangaPostRequest,
  | "review"
  | "storylineRating"
  | "qualityRating"
  | "enjoymentRating"
  | "personalScore"
>;

type MangaFilterSort = {
  sortBy: string;
  sortOrder: SortOrder;
  filterAuthor?: number;
  filterGenre?: number;
  filterTheme?: number;
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