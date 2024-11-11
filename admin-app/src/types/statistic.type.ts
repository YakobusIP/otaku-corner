type MediaConsumption = {
  period: string;
  anime: number;
  manga: number;
  lightNovel: number;
};

type AllowedMedia = "anime" | "manga" | "lightNovel";

type MediaProgress = {
  status: string;
  count: number;
  fill?: string;
};

type GenreConsumption = {
  name: string;
  animeCount: number;
  mangaCount: number;
  lightNovelCount: number;
  totalCount: number;
};

type StudioConsumption = {
  name: string;
  animeCount: number;
  totalCount: number;
};

type ThemeConsumption = {
  name: string;
  animeCount: number;
  mangaCount: number;
  lightNovelCount: number;
  totalCount: number;
};

type AuthorConsumption = {
  name: string;
  mangaCount: number;
  lightNovelCount: number;
  totalCount: number;
};

type AllTimeStatistic = {
  allMediaCount: number;
  animeCount: number;
  mangaCount: number;
  lightNovelCount: number;
  averageMalScore: number;
  averagePersonalScore: number;
};

export type {
  MediaConsumption,
  MediaProgress,
  AllowedMedia,
  GenreConsumption,
  StudioConsumption,
  ThemeConsumption,
  AuthorConsumption,
  AllTimeStatistic
};
