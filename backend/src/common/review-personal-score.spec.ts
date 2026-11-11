import {
  computeRoundedWeightedPersonalScore,
  roundPersonalScoreTwoDecimals
} from "./review-personal-score";

const weights = { story: 0.4, art: 0.6 };

describe("roundPersonalScoreTwoDecimals", () => {
  it("rounds to two decimal places", () => {
    expect(roundPersonalScoreTwoDecimals(7.125)).toBe(7.13);
    expect(roundPersonalScoreTwoDecimals(7.124)).toBe(7.12);
  });
});

describe("computeRoundedWeightedPersonalScore", () => {
  it("returns null when any weighted rating is null", () => {
    expect(
      computeRoundedWeightedPersonalScore(
        { story: 8, art: null },
        weights
      )
    ).toBe(null);
  });

  it("returns null when any weighted rating is undefined", () => {
    expect(
      computeRoundedWeightedPersonalScore({ story: 8, art: undefined }, weights)
    ).toBe(null);
  });

  it("returns the weighted sum of ratings", () => {
    expect(
      computeRoundedWeightedPersonalScore({ story: 10, art: 5 }, weights)
    ).toBe(7);
  });

  it("treats a rating of 0 as a valid score", () => {
    expect(
      computeRoundedWeightedPersonalScore({ story: 0, art: 10 }, weights)
    ).toBe(6);
  });

  it("applies two-decimal rounding to the weighted result", () => {
    expect(
      computeRoundedWeightedPersonalScore({ story: 5, art: 5.21 }, weights)
    ).toBe(5.13);
  });
});
