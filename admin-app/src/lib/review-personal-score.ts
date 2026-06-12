export const ANIME_REVIEW_PERSONAL_SCORE_WEIGHTS = {
  storylineRating: 0.3,
  qualityRating: 0.25,
  voiceActingRating: 0.2,
  soundTrackRating: 0.15,
  charDevelopmentRating: 0.1
} as const;

export const MANGA_REVIEW_PERSONAL_SCORE_WEIGHTS = {
  storylineRating: 0.3,
  artStyleRating: 0.25,
  charDevelopmentRating: 0.2,
  worldBuildingRating: 0.15,
  originalityRating: 0.1
} as const;

export const LIGHT_NOVEL_REVIEW_PERSONAL_SCORE_WEIGHTS = {
  storylineRating: 0.3,
  worldBuildingRating: 0.25,
  writingStyleRating: 0.2,
  charDevelopmentRating: 0.15,
  originalityRating: 0.1
} as const;

const TWO_DECIMAL_FACTOR = 100;

const roundPersonalScoreTwoDecimals = (score: number): number =>
  Math.round(score * TWO_DECIMAL_FACTOR) / TWO_DECIMAL_FACTOR;

export const computeRoundedWeightedPersonalScore = (
  ratingsByKey: Record<string, number | null | undefined>,
  weights: Readonly<Record<string, number>>
): number | null => {
  let sum = 0;
  for (const [key, weight] of Object.entries(weights)) {
    const value = ratingsByKey[key];
    if (value == null) {
      return null;
    }
    sum += value * weight;
  }
  return roundPersonalScoreTwoDecimals(sum);
};
