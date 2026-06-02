export function andWhereClauses(
  base: Record<string, unknown>,
  extra: Record<string, unknown>
): Record<string, unknown> {
  const baseKeys = Object.keys(base);
  const extraKeys = Object.keys(extra);
  if (extraKeys.length === 0) {
    return base;
  }
  if (baseKeys.length === 0) {
    return extra;
  }
  return { AND: [base, extra] };
}
