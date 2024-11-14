type TopMediaAndYearlyCount = {
  anime: {
    count: number;
    images: {
      image_url: string;
      large_image_url?: string | null;
      small_image_url?: string | null;
    } | null;
    title: string | null;
    score: number | null;
  };
  manga: {
    count: number;
    images: {
      image_url: string;
      large_image_url?: string | null;
      small_image_url?: string | null;
    } | null;
    title: string | null;
    score: number | null;
  };
  lightNovel: {
    count: number;
    images: {
      image_url: string;
      large_image_url?: string | null;
      small_image_url?: string | null;
    } | null;
    title: string | null;
    score: number | null;
  };
};

export type { TopMediaAndYearlyCount };
