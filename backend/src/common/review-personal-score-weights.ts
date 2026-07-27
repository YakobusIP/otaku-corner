import { BadRequestException } from "@nestjs/common";

const WEIGHT_SUM_TOLERANCE = 0.001;

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const parseNumericScoreWeights = (
  value: unknown,
  expectedKeys: readonly string[]
): Record<string, number> => {
  if (!isPlainObject(value)) {
    throw new BadRequestException("Setting value must be a JSON object");
  }

  const providedKeys = Object.keys(value);
  const expectedKeySet = new Set(expectedKeys);
  const unexpectedKeys = providedKeys.filter((key) => !expectedKeySet.has(key));
  const missingKeys = expectedKeys.filter((key) => !(key in value));

  if (unexpectedKeys.length > 0) {
    throw new BadRequestException(
      `Unexpected weight keys: ${unexpectedKeys.join(", ")}`
    );
  }

  if (missingKeys.length > 0) {
    throw new BadRequestException(
      `Missing weight keys: ${missingKeys.join(", ")}`
    );
  }

  const weights: Record<string, number> = {};

  for (const key of expectedKeys) {
    const rawWeight = value[key];

    if (typeof rawWeight !== "number" || !Number.isFinite(rawWeight)) {
      throw new BadRequestException(
        `Weight for "${key}" must be a finite number`
      );
    }

    if (rawWeight < 0 || rawWeight > 1) {
      throw new BadRequestException(
        `Weight for "${key}" must be between 0 and 1`
      );
    }

    weights[key] = rawWeight;
  }

  const sum = Object.values(weights).reduce(
    (total, weight) => total + weight,
    0
  );
  if (Math.abs(sum - 1) > WEIGHT_SUM_TOLERANCE) {
    throw new BadRequestException(
      `Score weights must sum to 1 (received ${sum.toFixed(4)})`
    );
  }

  return weights;
};
