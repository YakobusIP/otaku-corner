export const PROGRESS_STATUSES: Record<string, string> = {
  COMPLETED: "Completed",
  ON_PROGRESS: "On Progress",
  ON_HOLD: "On Hold",
  PLANNED: "Planned",
  DROPPED: "Dropped"
};

export const SCORE_RANGES: Record<string, { min: number; max: number }> = {
  poor: { min: 1, max: 3.99 },
  average: { min: 4, max: 6.99 },
  good: { min: 7, max: 8.99 },
  excellent: { min: 9, max: 10 }
};
