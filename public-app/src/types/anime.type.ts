import {
  GenreEntityPartial,
  StudioEntityPartial,
  ThemeEntityPartial
} from "@/types/entity.type";

import { PROGRESS_STATUS, type ProgressStatusKey } from "@/lib/shared/enums";

type AnimeEntity = {
  id: number;
  slug: string;
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
  score: number | null;
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
  review: AnimeReview | null;
  createdAt: Date;
  updatedAt: Date;
};

type AnimeReview = {
  id: number;
  reviewText?: string | null;
  storylineRating?: number | null;
  qualityRating?: number | null;
  voiceActingRating?: number | null;
  soundTrackRating?: number | null;
  charDevelopmentRating?: number | null;
  progressStatus: ProgressStatusKey | PROGRESS_STATUS;
  personalScore?: number | null;
  consumedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type AnimeDetail = Omit<AnimeEntity, "genres" | "studios" | "themes"> & {
  genres: GenreEntityPartial[];
  studios: StudioEntityPartial[];
  themes: ThemeEntityPartial[];
};

type AnimeListReviewFields = {
  progressStatus?: ProgressStatusKey | PROGRESS_STATUS | null;
  personalScore?: number | null;
  reviewText?: string | null;
  consumedAt?: Date | null;
};

type AnimeList = Pick<
  AnimeEntity,
  | "id"
  | "slug"
  | "title"
  | "titleJapanese"
  | "rating"
  | "type"
  | "status"
  | "images"
  | "score"
  | "season"
  | "aired"
> &
  AnimeListReviewFields & {
    fetchedEpisode: number;
  };

type AnimeSitemap = Pick<AnimeEntity, "id" | "slug"> & {
  createdAt: Date;
  updatedAt: Date;
};

type AnimeEpisode = {
  id: number;
  aired: string;
  number: number;
  title: string;
  titleJapanese: string;
  titleRomaji: string;
};

type AnimeFilters = {
  genre?: number;
  studio?: number;
  theme?: number;
  malScore?: string;
  personalScore?: string;
  type?: string;
};

export type { AnimeDetail, AnimeFilters, AnimeList, AnimeSitemap };
