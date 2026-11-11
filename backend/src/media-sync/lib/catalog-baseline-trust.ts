/** Baseline rows seeded from local catalog during migration — not upstream-verified. */
export const UNTRUSTED_BASELINE_SOURCES = new Set(["backfill"]);

export const isTrustedBaselineSource = (
  source: string | null | undefined
): boolean => {
  if (!source) {
    return false;
  }
  return !UNTRUSTED_BASELINE_SOURCES.has(source);
};

export const isTrustedBaselineCatalog = (
  baselineCatalog: Record<string, unknown> | null | undefined,
  baselineSource: string | null | undefined
): boolean => {
  if (!isTrustedBaselineSource(baselineSource)) {
    return false;
  }
  if (!baselineCatalog || typeof baselineCatalog !== "object") {
    return false;
  }
  return Object.keys(baselineCatalog).length > 0;
};
