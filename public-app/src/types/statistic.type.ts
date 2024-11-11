type TopMediaAndYearlyCount = {
  anime: {
    count: number;
    images: {
      image_url: string;
      large_image_url?: string | null;
      small_image_url?: string | null;
    };
    title: string;
    score: number;
  };
  manga: {
    count: number;
    images: {
      image_url: string;
      large_image_url?: string | null;
      small_image_url?: string | null;
    };
    title: string;
    score: number;
  };
  lightNovel: {
    count: number;
    images: {
      image_url: string;
      large_image_url?: string | null;
      small_image_url?: string | null;
    };
    title: string;
    score: number;
  };
};

export type { TopMediaAndYearlyCount };
