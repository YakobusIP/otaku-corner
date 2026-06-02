import { type AnimeScoreCriterion } from "@/components/anime/anime-detail-helpers";

type MangaReviewRatings = {
  storylineRating?: number | null;
  artStyleRating?: number | null;
  charDevelopmentRating?: number | null;
  worldBuildingRating?: number | null;
  originalityRating?: number | null;
};

export const buildMangaScoreCriteria = (
  review: MangaReviewRatings | null | undefined
): AnimeScoreCriterion[] => {
  if (!review) {
    return [];
  }

  return [
    { title: "Storyline", score: review.storylineRating },
    { title: "Art Style", score: review.artStyleRating },
    {
      title: "Character Development",
      score: review.charDevelopmentRating
    },
    { title: "World Building", score: review.worldBuildingRating },
    { title: "Originality", score: review.originalityRating }
  ];
};

export const formatMangaChaptersLabel = (chaptersCount?: number | null) => {
  if (chaptersCount == null || chaptersCount <= 0) {
    return "Unknown chapters";
  }

  return `${chaptersCount} Chapters`;
};

export const formatMangaVolumesLabel = (volumesCount?: number | null) => {
  if (volumesCount == null || volumesCount <= 0) {
    return "Unknown volumes";
  }

  return `${volumesCount} Volumes`;
};
