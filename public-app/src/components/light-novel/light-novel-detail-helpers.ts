import { type AnimeScoreCriterion } from "@/components/anime/anime-detail-helpers";

type LightNovelReviewRatings = {
  storylineRating?: number | null;
  worldBuildingRating?: number | null;
  writingStyleRating?: number | null;
  charDevelopmentRating?: number | null;
  originalityRating?: number | null;
};

export const buildLightNovelScoreCriteria = (
  review: LightNovelReviewRatings | null | undefined
): AnimeScoreCriterion[] => {
  if (!review) {
    return [];
  }

  return [
    { title: "Storyline", score: review.storylineRating },
    { title: "World Building", score: review.worldBuildingRating },
    { title: "Writing Style", score: review.writingStyleRating },
    {
      title: "Character Development",
      score: review.charDevelopmentRating
    },
    { title: "Originality", score: review.originalityRating }
  ];
};

export const formatLightNovelVolumesLabel = (volumesCount?: number | null) => {
  if (volumesCount == null || volumesCount <= 0) {
    return "Unknown volumes";
  }

  return `${volumesCount} Volume${volumesCount === 1 ? "" : "s"}`;
};
