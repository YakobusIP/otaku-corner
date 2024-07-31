type AnimePostRequest = {
  mal_id: number;
  title: string;
  title_japanese: string;
  title_synonyms: string;
  type: string;
  status: string;
  airing: boolean;
  aired_from?: string | null;
  aired_to?: string | null;
  duration: string;
  episodes?: number | null;
  genres: Array<string>;
  images: {
    image_url: string;
    large_image_url?: string | null;
    small_image_url?: string | null;
  };
  rating: string;
  score: number;
  season?: string | null;
  studios: Array<string>;
  themes: Array<string>;
  synopsis: string;
  trailer?: string | null;
  mal_url: string;
};

type AnimeList = {
  id: string;
  title: string;
  title_japanese: string;
  type: string;
  status: string;
  images: {
    image_url: string;
    large_image_url?: string | null;
    small_image_url?: string | null;
  };
  rating: string;
  score: number;
};

export { type AnimePostRequest, type AnimeList };
