export const ANIME_REVIEW_PERSONAL_SCORE_WEIGHT_KEYS = [
  "storylineRating",
  "qualityRating",
  "voiceActingRating",
  "soundTrackRating",
  "charDevelopmentRating"
] as const;

export const MANGA_REVIEW_PERSONAL_SCORE_WEIGHT_KEYS = [
  "storylineRating",
  "artStyleRating",
  "charDevelopmentRating",
  "worldBuildingRating",
  "originalityRating"
] as const;

export const LIGHT_NOVEL_REVIEW_PERSONAL_SCORE_WEIGHT_KEYS = [
  "storylineRating",
  "worldBuildingRating",
  "writingStyleRating",
  "charDevelopmentRating",
  "originalityRating"
] as const;

export type AnimeReviewPersonalScoreWeightKey =
  (typeof ANIME_REVIEW_PERSONAL_SCORE_WEIGHT_KEYS)[number];
export type MangaReviewPersonalScoreWeightKey =
  (typeof MANGA_REVIEW_PERSONAL_SCORE_WEIGHT_KEYS)[number];
export type LightNovelReviewPersonalScoreWeightKey =
  (typeof LIGHT_NOVEL_REVIEW_PERSONAL_SCORE_WEIGHT_KEYS)[number];
