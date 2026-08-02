export const REVIEW_PERSONAL_SCORE_WEIGHTS_SETTING_KEYS = {
  anime: "review.personal_score_weights.anime",
  manga: "review.personal_score_weights.manga",
  lightNovel: "review.personal_score_weights.light_novel"
} as const;

export type ReviewPersonalScoreWeightsMediaType =
  keyof typeof REVIEW_PERSONAL_SCORE_WEIGHTS_SETTING_KEYS;

export type ReviewScoreWeightField = {
  key: string;
  label: string;
};

export const REVIEW_SCORE_WEIGHT_FIELDS: Record<
  ReviewPersonalScoreWeightsMediaType,
  readonly ReviewScoreWeightField[]
> = {
  anime: [
    { key: "storylineRating", label: "Storyline" },
    { key: "qualityRating", label: "Animation Quality" },
    { key: "voiceActingRating", label: "Voice Acting" },
    { key: "soundTrackRating", label: "Soundtrack" },
    { key: "charDevelopmentRating", label: "Character Development" }
  ],
  manga: [
    { key: "storylineRating", label: "Storyline" },
    { key: "artStyleRating", label: "Art Style" },
    { key: "charDevelopmentRating", label: "Character Development" },
    { key: "worldBuildingRating", label: "World Building" },
    { key: "originalityRating", label: "Originality" }
  ],
  lightNovel: [
    { key: "storylineRating", label: "Storyline" },
    { key: "worldBuildingRating", label: "World Building" },
    { key: "writingStyleRating", label: "Writing Style" },
    { key: "charDevelopmentRating", label: "Character Development" },
    { key: "originalityRating", label: "Originality" }
  ]
};

export const REVIEW_SCORE_WEIGHT_SETTING_CONFIG: ReadonlyArray<{
  id: ReviewPersonalScoreWeightsMediaType;
  label: string;
  settingKey: string;
}> = [
  {
    id: "anime",
    label: "Anime",
    settingKey: REVIEW_PERSONAL_SCORE_WEIGHTS_SETTING_KEYS.anime
  },
  {
    id: "manga",
    label: "Manga",
    settingKey: REVIEW_PERSONAL_SCORE_WEIGHTS_SETTING_KEYS.manga
  },
  {
    id: "lightNovel",
    label: "Light Novel",
    settingKey: REVIEW_PERSONAL_SCORE_WEIGHTS_SETTING_KEYS.lightNovel
  }
];
