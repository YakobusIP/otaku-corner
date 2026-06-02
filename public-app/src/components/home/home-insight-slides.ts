import type { TasteProfileRow } from "@/types/statistic.type";

export type DistributionRow = {
  label: string;
  percentage: number;
};

export const mapTasteProfileRows = (
  rows: TasteProfileRow[] | undefined
): DistributionRow[] => {
  return (rows ?? []).map((row) => {
    return {
      label: row.name,
      percentage: row.percentage
    };
  });
};

export const DISTRIBUTION_INSIGHT_CARDS = [
  {
    title: "Genre Distribution",
    tasteKey: "genres" as const,
    barClass: "from-pink-400 to-rose-500"
  },
  {
    title: "Author Distribution",
    tasteKey: "authors" as const,
    barClass: "from-violet-400 to-fuchsia-500"
  },
  {
    title: "Studio Distribution",
    tasteKey: "studios" as const,
    barClass: "from-sky-400 to-indigo-500"
  },
  {
    title: "Theme Distribution",
    tasteKey: "themes" as const,
    barClass: "from-amber-400 to-orange-500"
  }
] as const;
