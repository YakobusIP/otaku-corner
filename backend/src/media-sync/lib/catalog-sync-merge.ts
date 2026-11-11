import { stringSimilarity } from "string-similarity-js";

export type SyncConflictRule =
  | "null_clear"
  | "count_zero_regression"
  | "large_decrease"
  | "identity_drift"
  | "divergent_change";

export type SyncConflict = {
  field: string;
  base: unknown;
  local: unknown;
  upstream: unknown;
  rule: SyncConflictRule;
};

export type MergeFieldResult =
  | { kind: "apply"; value: unknown }
  | { kind: "conflict"; conflict: SyncConflict }
  | { kind: "noop" };

const COUNT_FIELDS = new Set([
  "episodesCount",
  "chaptersCount",
  "volumesCount"
]);

const TITLE_SIMILARITY_THRESHOLD = 0.9;

export const CONFLICT_RULE_LABELS: Record<SyncConflictRule, string> = {
  null_clear: "Upstream is empty but local has a value",
  count_zero_regression: "Upstream count dropped to zero",
  large_decrease: "Upstream count dropped sharply",
  identity_drift: "Title looks like a different work",
  divergent_change: "Local and upstream both changed from the last sync"
};

export const hasFieldBaseline = (base: unknown): boolean => base !== undefined;

export const mergeCatalogFieldThreeWay = (
  field: string,
  base: unknown,
  local: unknown,
  upstream: unknown
): MergeFieldResult => {
  if (!hasFieldBaseline(base)) {
    return mergeCatalogFieldUntrustedBaseline(field, local, upstream);
  }

  const baseEqualsLocal = catalogValuesEqual(field, base, local);
  const baseEqualsUpstream = catalogValuesEqual(field, base, upstream);
  const localEqualsUpstream = catalogValuesEqual(field, local, upstream);

  if (baseEqualsLocal && baseEqualsUpstream) {
    return { kind: "noop" };
  }

  if (baseEqualsLocal && !baseEqualsUpstream) {
    return applyUpstreamWithGuards(field, base, local, upstream);
  }

  if (!baseEqualsLocal && baseEqualsUpstream) {
    return { kind: "noop" };
  }

  if (!baseEqualsLocal && !baseEqualsUpstream && localEqualsUpstream) {
    return { kind: "noop" };
  }

  const regressionConflict = detectRegressionConflict(field, local, upstream);
  if (regressionConflict) {
    return {
      kind: "conflict",
      conflict: { ...regressionConflict, base }
    };
  }

  if (field === "title") {
    const titleDrift = detectTitleIdentityDrift(
      typeof local === "string" ? local : "",
      typeof upstream === "string" ? upstream : ""
    );
    if (titleDrift) {
      return {
        kind: "conflict",
        conflict: { ...titleDrift, base }
      };
    }
  }

  return {
    kind: "conflict",
    conflict: {
      field,
      base,
      local,
      upstream,
      rule: "divergent_change"
    }
  };
};

/** Absent/untrusted baseline: never overwrite populated local values without review. */
export const mergeCatalogFieldUntrustedBaseline = (
  field: string,
  local: unknown,
  upstream: unknown
): MergeFieldResult => {
  if (isEmpty(local)) {
    if (isEmpty(upstream)) {
      return { kind: "noop" };
    }
    return { kind: "apply", value: upstream };
  }

  if (isEmpty(upstream)) {
    return {
      kind: "conflict",
      conflict: {
        field,
        base: null,
        local,
        upstream: null,
        rule: "null_clear"
      }
    };
  }

  if (COUNT_FIELDS.has(field) && isNumber(local) && isNumber(upstream)) {
    const countConflict = detectCountConflict(field, local, upstream);
    if (countConflict) {
      return {
        kind: "conflict",
        conflict: { ...countConflict, base: null }
      };
    }
  }

  if (catalogValuesEqual(field, local, upstream)) {
    return { kind: "noop" };
  }

  return {
    kind: "conflict",
    conflict: {
      field,
      base: null,
      local,
      upstream,
      rule: "divergent_change"
    }
  };
};

/** @deprecated Use mergeCatalogFieldUntrustedBaseline for absent baseline semantics. */
export const mergeCatalogFieldFirstSync = mergeCatalogFieldUntrustedBaseline;

/** @deprecated Use mergeCatalogFieldThreeWay. Kept for tests and transitional imports. */
export const mergeCatalogField = (
  field: string,
  local: unknown,
  upstream: unknown
): MergeFieldResult => mergeCatalogFieldFirstSync(field, local, upstream);

const applyUpstreamWithGuards = (
  field: string,
  base: unknown,
  local: unknown,
  upstream: unknown
): MergeFieldResult => {
  if (isEmpty(upstream)) {
    return {
      kind: "conflict",
      conflict: {
        field,
        base,
        local,
        upstream: null,
        rule: "null_clear"
      }
    };
  }

  if (COUNT_FIELDS.has(field) && isNumber(local) && isNumber(upstream)) {
    const countConflict = detectCountConflict(field, local, upstream);
    if (countConflict) {
      return {
        kind: "conflict",
        conflict: { ...countConflict, base }
      };
    }
  }

  if (field === "title") {
    const titleDrift = detectTitleIdentityDrift(
      typeof local === "string" ? local : "",
      typeof upstream === "string" ? upstream : ""
    );
    if (titleDrift) {
      return {
        kind: "conflict",
        conflict: { ...titleDrift, base }
      };
    }
  }

  if (catalogValuesEqual(field, local, upstream)) {
    return { kind: "noop" };
  }

  return { kind: "apply", value: upstream };
};

const detectRegressionConflict = (
  field: string,
  local: unknown,
  upstream: unknown
): Omit<SyncConflict, "base"> | null => {
  if (isEmpty(upstream)) {
    return {
      field,
      local,
      upstream: null,
      rule: "null_clear"
    };
  }

  if (COUNT_FIELDS.has(field) && isNumber(local) && isNumber(upstream)) {
    return detectCountConflict(field, local, upstream);
  }

  return null;
};

const detectCountConflict = (
  field: string,
  local: number,
  upstream: number
): Omit<SyncConflict, "base"> | null => {
  if (local > 0 && upstream === 0) {
    return {
      field,
      local,
      upstream,
      rule: "count_zero_regression"
    };
  }

  if (upstream < local) {
    const absoluteDelta = local - upstream;
    const relativeDrop = absoluteDelta / local;
    if (relativeDrop >= 0.5 && absoluteDelta >= 3) {
      return {
        field,
        local,
        upstream,
        rule: "large_decrease"
      };
    }
  }

  return null;
};

export const detectTitleIdentityDrift = (
  localTitle: string,
  upstreamTitle: string
): Omit<SyncConflict, "base"> | null => {
  const local = localTitle.trim();
  const upstream = upstreamTitle.trim();

  if (!local || !upstream) {
    return null;
  }

  if (stringSimilarity(local, upstream) >= TITLE_SIMILARITY_THRESHOLD) {
    return null;
  }

  return {
    field: "title",
    local,
    upstream,
    rule: "identity_drift"
  };
};

export const catalogValuesEqual = (
  field: string,
  left: unknown,
  right: unknown
): boolean => {
  if (left === right) {
    return true;
  }

  if (isEmpty(left) && isEmpty(right)) {
    return true;
  }

  if (isNumber(left) && isNumber(right)) {
    return left === right;
  }

  if (typeof left === "string" && typeof right === "string") {
    return normalizeComparableString(left) === normalizeComparableString(right);
  }

  if (field === "images") {
    return stableJson(left) === stableJson(right);
  }

  if (
    (typeof left === "object" && left !== null) ||
    (typeof right === "object" && right !== null)
  ) {
    return stableJson(left) === stableJson(right);
  }

  return false;
};

const isEmpty = (value: unknown): boolean => {
  if (value === null || value === undefined) {
    return true;
  }
  if (typeof value === "string") {
    return value.trim().length === 0;
  }
  return false;
};

const isNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const normalizeComparableString = (value: string): string =>
  value.trim().replace(/\s+/g, " ");

const stableJson = (value: unknown): string => {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};
