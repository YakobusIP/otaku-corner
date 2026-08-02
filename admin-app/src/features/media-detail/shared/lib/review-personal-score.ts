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
