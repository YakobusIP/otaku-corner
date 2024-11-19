import {
  GenreEntityPartial,
  StudioEntityPartial,
  ThemeEntityPartial
} from "@/types/entity.type";

import { PROGRESS_STATUS, SORT_ORDER } from "@/lib/enums";

type AnimeEntity = {
  id: string;
  malId: number;
  type: string;
  status: string;
  rating: string;
  season?: string | null;
  title: string;
  titleJapanese: string;
  titleSynonyms: string;
  source: string;
  aired: string;
  broadcast: string;
  episodesCount?: number | null;
  duration: string;
  score: number;
  images: {
    image_url: string;
    large_image_url?: string | null;
    small_image_url?: string | null;
  };
  genres: string[];
  studios: string[];
  themes: string[];
  episodes: AnimeEpisode[];
  synopsis: string;
  trailer?: string | null;
  malUrl: string;
  review: AnimeReview;
  createdAt: Date;
  updatedAt: Date;
};

type AnimeReview = {
  id: string;
  review?: string | null;
  storylineRating?: number | null;
  qualityRating?: number | null;
  voiceActingRating?: number | null;
  soundTrackRating?: number | null;
  charDevelopmentRating?: number | null;
  progressStatus: PROGRESS_STATUS;
  personalScore?: number | null;
  consumedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type AnimeCreateRequest = {
  malId: number;
  type: string;
  status: string;
  rating: string;
  season?: string | null;
  title: string;
  titleJapanese: string;
  titleSynonyms: string;
  source: string;
  aired: string;
  broadcast: string;
  episodesCount?: number | null;
  duration: string;
  score: number;
  images: {
    image_url: string;
    large_image_url?: string | null;
    small_image_url?: string | null;
  };
  genres: string[];
  studios: string[];
  themes: string[];
  synopsis: string;
  trailer?: string | null;
  malUrl: string;
};

type AnimeDetail = Omit<AnimeEntity, "genres" | "studios" | "themes"> & {
  id: string;
  genres: GenreEntityPartial[];
  studios: StudioEntityPartial[];
  themes: ThemeEntityPartial[];
};

type AnimeList = Pick<
  AnimeEntity,
  | "id"
  | "title"
  | "titleJapanese"
  | "rating"
  | "type"
  | "status"
  | "images"
  | "score"
> &
  Pick<
    AnimeReview,
    "progressStatus" | "personalScore" | "review" | "consumedAt"
  > & {
    fetchedEpisode: number;
  };

type AnimeEpisode = {
  id?: string;
  aired: string;
  number: number;
  title: string;
  titleJapanese: string;
  titleRomaji: string;
};

type AnimeReviewRequest = Omit<AnimeReview, "id" | "createdAt" | "updatedAt">;

type AnimeFilterSort = {
  sortBy: string;
  sortOrder: SORT_ORDER;
  filterGenre?: string;
  filterStudio?: string;
  filterTheme?: string;
  filterMALScore?: string;
  filterPersonalScore?: string;
  filterType?: string;
  filterStatusCheck?: string;
};

export type {
  AnimeCreateRequest,
  AnimeDetail,
  AnimeList,
  AnimeReviewRequest,
  AnimeFilterSort
};
