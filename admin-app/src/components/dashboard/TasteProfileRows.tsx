import type { TasteProfileRow } from "@/types/statistic.type";

import { cn } from "@/lib/utils";

const CHART_COLORS = [
  "bg-[hsl(var(--chart-1))]",
  "bg-[hsl(var(--chart-2))]",
  "bg-[hsl(var(--chart-3))]",
  "bg-[hsl(var(--chart-4))]",
  "bg-[hsl(var(--chart-5))]",
  "bg-violet-500",
  "bg-sky-400",
  "bg-amber-400",
  "bg-emerald-400",
  "bg-rose-400"
];

type TasteProfileRowsProps = {
  rows: TasteProfileRow[];
};

export default function TasteProfileRows(props: TasteProfileRowsProps) {
  const { rows } = props;

  return (
    <ul className="flex flex-col gap-3 pt-2">
      {rows.map((row, index) => (
        <li key={row.name} className="flex items-center gap-3 text-sm">
          <span className="w-[32%] min-w-0 shrink-0 truncate font-medium @sm:w-[28%]">
            {row.name}
          </span>
          <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-secondary">
            <div
              className={cn(
                "h-full rounded-full transition-[width] duration-500 ease-out",
                CHART_COLORS[index % CHART_COLORS.length]
              )}
              style={{ width: `${row.percentage}%` }}
            />
          </div>
          <span className="w-14 shrink-0 text-right tabular-nums text-muted-foreground @sm:w-16">
            {row.percentage.toFixed(1)}%
          </span>
        </li>
      ))}
    </ul>
  );
}
