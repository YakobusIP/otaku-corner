export const REVIEW_PERSONAL_SCORE_WEIGHTS_SETTING_KEYS = {
  anime: "review.personal_score_weights.anime",
  manga: "review.personal_score_weights.manga",
  lightNovel: "review.personal_score_weights.light_novel"
} as const;

export type ReviewPersonalScoreWeightsMediaType =
  keyof typeof REVIEW_PERSONAL_SCORE_WEIGHTS_SETTING_KEYS;

export const REVIEW_PERSONAL_SCORE_WEIGHTS_SETTING_KEY_VALUES = Object.values(
  REVIEW_PERSONAL_SCORE_WEIGHTS_SETTING_KEYS
);

export const isReviewPersonalScoreWeightsSettingKey = (
  key: string
): key is (typeof REVIEW_PERSONAL_SCORE_WEIGHTS_SETTING_KEY_VALUES)[number] =>
  (
    REVIEW_PERSONAL_SCORE_WEIGHTS_SETTING_KEY_VALUES as readonly string[]
  ).includes(key);

export const mediaTypeFromReviewPersonalScoreWeightsSettingKey = (
  key: string
): ReviewPersonalScoreWeightsMediaType | null => {
  for (const [mediaType, settingKey] of Object.entries(
    REVIEW_PERSONAL_SCORE_WEIGHTS_SETTING_KEYS
  ) as Array<[ReviewPersonalScoreWeightsMediaType, string]>) {
    if (settingKey === key) {
      return mediaType;
    }
  }

  return null;
};
