type AnimePostRequest = {
  mal_id: number;
  type: string;
  status: string;
  rating: string;
  season?: string | null;
  title: string;
  title_japanese: string;
  title_synonyms: string;
  source: string;
  aired: string;
  broadcast: string;
  episodes?: number | null;
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
