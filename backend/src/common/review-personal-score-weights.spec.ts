import { parseNumericScoreWeights } from "./review-personal-score-weights";

const EXPECTED_KEYS = ["a", "b"] as const;

const validWeights = { a: 0.4, b: 0.6 };

describe("parseNumericScoreWeights", () => {
  it("returns weights when every expected key is present and sums to 1", () => {
    expect(parseNumericScoreWeights(validWeights, EXPECTED_KEYS)).toEqual(
      validWeights
    );
  });

  it("rejects values that are not plain objects", () => {
    const message = "Setting value must be a JSON object";
    expect(() => parseNumericScoreWeights(null, EXPECTED_KEYS)).toThrow(
      message
    );
    expect(() => parseNumericScoreWeights([], EXPECTED_KEYS)).toThrow(message);
    expect(() => parseNumericScoreWeights("obj", EXPECTED_KEYS)).toThrow(
      message
    );
  });

  it("rejects unexpected keys", () => {
    expect(() =>
      parseNumericScoreWeights({ ...validWeights, extra: 0 }, EXPECTED_KEYS)
    ).toThrow(/Unexpected weight keys: extra/);
  });

  it("rejects missing expected keys", () => {
    expect(() => parseNumericScoreWeights({ a: 1 }, EXPECTED_KEYS)).toThrow(
      /Missing weight keys: b/
    );
  });

  it("rejects weights that are not numbers", () => {
    expect(() =>
      parseNumericScoreWeights({ a: "0.4", b: 0.6 }, EXPECTED_KEYS)
    ).toThrow('Weight for "a" must be a finite number');
  });

  it("rejects non-finite weights", () => {
    expect(() =>
      parseNumericScoreWeights({ a: Number.NaN, b: 0.6 }, EXPECTED_KEYS)
    ).toThrow('Weight for "a" must be a finite number');
    expect(() =>
      parseNumericScoreWeights({ a: Number.POSITIVE_INFINITY, b: 0.6 }, EXPECTED_KEYS)
    ).toThrow('Weight for "a" must be a finite number');
  });

  it("rejects weights below 0 or above 1", () => {
    expect(() =>
      parseNumericScoreWeights({ a: -0.1, b: 1.1 }, EXPECTED_KEYS)
    ).toThrow('Weight for "a" must be between 0 and 1');
    expect(() =>
      parseNumericScoreWeights({ a: 0.4, b: 1.1 }, EXPECTED_KEYS)
    ).toThrow('Weight for "b" must be between 0 and 1');
  });

  it("rejects weights whose sum is not 1 beyond tolerance", () => {
    expect(() =>
      parseNumericScoreWeights({ a: 0.5, b: 0.502 }, EXPECTED_KEYS)
    ).toThrow(/Score weights must sum to 1/);
  });

  it("accepts weights whose sum is within the 0.001 tolerance of 1", () => {
    expect(
      parseNumericScoreWeights({ a: 0.333, b: 0.6675 }, EXPECTED_KEYS)
    ).toEqual({ a: 0.333, b: 0.6675 });
  });
});
