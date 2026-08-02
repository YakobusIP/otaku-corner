const PERCENTAGE_SUM_TOLERANCE = 0.1;

export const parseNumericWeightsObject = (
  value: unknown
): Record<string, number> => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return {};
  }

  const weights: Record<string, number> = {};

  for (const [key, rawWeight] of Object.entries(value)) {
    if (typeof rawWeight === "number" && Number.isFinite(rawWeight)) {
      weights[key] = rawWeight;
    }
  }

  return weights;
};

export const decimalWeightToPercentage = (decimal: number): number =>
  Math.round(decimal * 10000) / 100;

export const percentageWeightToDecimal = (percentage: number): number =>
  Math.round(percentage * 100) / 10000;

export const getWeightsSum = (weights: Record<string, number>): number =>
  Object.values(weights).reduce((total, weight) => total + weight, 0);

export const isValidScoreWeightsPercentageSum = (
  percentages: Record<string, number>
): boolean =>
  Math.abs(getWeightsSum(percentages) - 100) <= PERCENTAGE_SUM_TOLERANCE;

export const hasValidFixedScoreWeightPercentages = (
  fields: readonly { key: string }[],
  percentages: Record<string, number>
): boolean =>
  fields.every(({ key }) => {
    const percentage = percentages[key];
    return (
      typeof percentage === "number" &&
      Number.isFinite(percentage) &&
      percentage >= 0 &&
      percentage <= 100
    );
  });

