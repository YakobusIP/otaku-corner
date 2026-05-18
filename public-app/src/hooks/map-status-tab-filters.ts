import type { StatusFilter } from "@/types/statistic.type";

export const mapStatusCountsToTabFilters = (
  statusCount: StatusFilter[] | undefined
) =>
  statusCount?.map((count) =>
    count.label === "All" ? { ...count, value: undefined } : count
  );
