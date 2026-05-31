export const getSeasonProgressPercent = (
  watchedCount: number,
  totalCount: number
) => {
  if (totalCount <= 0) {
    return 0;
  }

  return Math.min(100, Math.round((watchedCount / totalCount) * 100));
};

type AnimeReviewRatings = {
  storylineRating?: number | null;
  qualityRating?: number | null;
  voiceActingRating?: number | null;
  soundTrackRating?: number | null;
  charDevelopmentRating?: number | null;
};

export type AnimeScoreCriterion = {
  title: string;
  score: number | null | undefined;
};

export const buildAnimeScoreCriteria = (
  review: AnimeReviewRatings | null | undefined
): AnimeScoreCriterion[] => {
  if (!review) {
    return [];
  }

  return [
    { title: "Storyline", score: review.storylineRating },
    { title: "Animation Quality", score: review.qualityRating },
    { title: "Voice Acting", score: review.voiceActingRating },
    { title: "Soundtrack", score: review.soundTrackRating },
    {
      title: "Character Development",
      score: review.charDevelopmentRating
    }
  ];
};

export const getScoreBarPercent = (score: number | null | undefined) => {
  if (score == null || score < 1) {
    return 0;
  }

  return Math.min(100, Math.round((score / 10) * 100));
};
