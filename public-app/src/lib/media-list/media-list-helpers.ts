import type { ActiveFilterChipConfig } from "@/types/context.type";

export const countActiveFilterChips = <TFilters extends Record<string, unknown>>(
  chips: ActiveFilterChipConfig<TFilters>[],
  filters: TFilters
) => chips.filter((chip) => filters[chip.key] !== undefined).length;
