import {
  REVIEW_PERSONAL_SCORE_WEIGHTS_SETTING_KEYS,
  isReviewPersonalScoreWeightsSettingKey,
  mediaTypeFromReviewPersonalScoreWeightsSettingKey
} from "./setting-keys";

describe("isReviewPersonalScoreWeightsSettingKey", () => {
  it.each(Object.entries(REVIEW_PERSONAL_SCORE_WEIGHTS_SETTING_KEYS))(
    "returns true for the %s weights setting key",
    (_mediaType, settingKey) => {
      expect(isReviewPersonalScoreWeightsSettingKey(settingKey)).toBe(true);
    }
  );

  it("returns false for an unknown setting key", () => {
    expect(isReviewPersonalScoreWeightsSettingKey("review.other")).toBe(false);
  });
});

describe("mediaTypeFromReviewPersonalScoreWeightsSettingKey", () => {
  it.each(Object.entries(REVIEW_PERSONAL_SCORE_WEIGHTS_SETTING_KEYS))(
    "maps the %s setting key to %s",
    (mediaType, settingKey) => {
      expect(
        mediaTypeFromReviewPersonalScoreWeightsSettingKey(settingKey)
      ).toBe(mediaType);
    }
  );

  it("returns null for an unknown setting key", () => {
    expect(
      mediaTypeFromReviewPersonalScoreWeightsSettingKey("media.catalog_sync")
    ).toBe(null);
  });
});
