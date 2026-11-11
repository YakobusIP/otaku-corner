export type MediaSyncConflictRule =
  | "null_clear"
  | "count_zero_regression"
  | "large_decrease"
  | "identity_drift"
  | "divergent_change";

export const CONFLICT_RULE_LABELS: Record<MediaSyncConflictRule, string> = {
  null_clear: "Upstream is empty but local has a value",
  count_zero_regression: "Upstream count dropped to zero",
  large_decrease: "Upstream count dropped sharply",
  identity_drift: "Title looks like a different work",
  divergent_change: "Local and upstream both changed from the last sync"
};

export const getConflictRuleLabel = (rule: string): string => {
  if (rule in CONFLICT_RULE_LABELS) {
    return CONFLICT_RULE_LABELS[rule as MediaSyncConflictRule];
  }
  return rule;
};
