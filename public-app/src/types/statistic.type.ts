type TopMediaAndYearlyCount = {
  anime: {
    id: number;
    slug: string;
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
    id: number;
    slug: string;
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
    id: number;
    slug: string;
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
