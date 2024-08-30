type AnimePostRequest = {
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
  genres: Array<string>;
  studios: Array<string>;
  themes: Array<string>;
  episodes: Array<AnimeEpisode>;
  synopsis: string;
  trailer?: string | null;
  malUrl: string;
  review: string | null;
  storylineRating: number | null;
  qualityRating: number | null;
  voiceActingRating: number | null;
  enjoymentRating: number | null;
  personalScore: number | null;
};

type AnimeDetail = AnimePostRequest & { id: string };

type AnimeList = {
  id: string;
  title: string;
  titleJapanese: string;
  type: string;
  status: string;
  images: {
    image_url: string;
    large_image_url?: string | null;
    small_image_url?: string | null;
  };
  rating: string;
  score: number;
  personalScore: number | null;
};

type AnimeEpisode = {
  id?: string;
  aired: string;
  number: number;
  title: string;
  titleJapanese: string;
  titleRomaji: string;
};

type AnimeReview = Pick<
  AnimePostRequest,
  | "review"
  | "storylineRating"
  | "qualityRating"
  | "voiceActingRating"
  | "enjoymentRating"
  | "personalScore"
>;

export {
  type AnimePostRequest,
  type AnimeDetail,
  type AnimeList,
  type AnimeReview
};
