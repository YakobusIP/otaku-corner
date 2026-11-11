export const buildAuditFieldDiff = (
  beforeRecord: Record<string, unknown>,
  afterRecord: Record<string, unknown>,
  fields?: string[]
): { before: Record<string, unknown>; after: Record<string, unknown> } => {
  const keys =
    fields ??
    Array.from(
      new Set([...Object.keys(beforeRecord), ...Object.keys(afterRecord)])
    );

  const before: Record<string, unknown> = {};
  const after: Record<string, unknown> = {};

  for (const key of keys) {
    const beforeValue = beforeRecord[key];
    const afterValue = afterRecord[key];
    if (!valuesEqual(beforeValue, afterValue)) {
      before[key] = beforeValue ?? null;
      after[key] = afterValue ?? null;
    }
  }

  return { before, after };
};

const valuesEqual = (left: unknown, right: unknown): boolean => {
  if (left === right) {
    return true;
  }

  if (
    typeof left === "object" &&
    left !== null &&
    typeof right === "object" &&
    right !== null
  ) {
    return JSON.stringify(left) === JSON.stringify(right);
  }

  return false;
};
