import QueryErrorState from "@/components/dashboard/QueryErrorState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";

import type { LibraryHealth } from "@/types/statistic.type";

import { PROGRESS_STATUS } from "@/lib/enums";

import { Loader2Icon } from "lucide-react";
import { Label, Pie, PieChart } from "recharts";

const chartConfig = {
  COMPLETED: {
    label: PROGRESS_STATUS.COMPLETED,
    color: "hsl(var(--chart-2))"
  },
  ON_PROGRESS: {
    label: PROGRESS_STATUS.ON_PROGRESS,
    color: "hsl(var(--chart-1))"
  },
  PLANNED: {
    label: PROGRESS_STATUS.PLANNED,
    color: "hsl(var(--chart-3))"
  },
  ON_HOLD: {
    label: PROGRESS_STATUS.ON_HOLD,
    color: "hsl(var(--chart-4))"
  },
  DROPPED: {
    label: PROGRESS_STATUS.DROPPED,
    color: "hsl(var(--chart-5))"
  }
} satisfies ChartConfig;

const STATUS_ACCENT: Record<string, string> = {
  COMPLETED: "hsl(var(--chart-2))",
  ON_PROGRESS: "hsl(var(--chart-1))",
  PLANNED: "hsl(var(--chart-3))",
  ON_HOLD: "hsl(var(--chart-4))",
  DROPPED: "hsl(var(--chart-5))"
};

const FALLBACK_ACCENTS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))"
] as const;

const statusLabel = (status: string) => {
  const key = status as keyof typeof PROGRESS_STATUS;
  if (key in PROGRESS_STATUS) {
    return PROGRESS_STATUS[key];
  }
  return status;
};

type Props = {
  data: LibraryHealth | undefined;
  isLoading: boolean;
  error: unknown | null;
};

export default function LibraryHealthCard({ data, isLoading, error }: Props) {
  if (error) {
    return (
      <Card className="flex h-full min-h-0 flex-col border-border/60 bg-card/80 backdrop-blur-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Library Health</CardTitle>
        </CardHeader>
        <CardContent className="flex min-h-[200px] flex-1 items-center justify-center px-6 pb-6 pt-0">
          <QueryErrorState error={error} />
        </CardContent>
      </Card>
    );
  }

  if (isLoading || !data) {
    return (
      <Card className="flex h-full min-h-0 flex-col border-border/60 bg-card/80 backdrop-blur-xl">
        <CardHeader className="pb-4">
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="flex min-h-[280px] flex-1 items-center justify-center px-6 pb-6 pt-0">
          <Loader2Icon className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const pieRows = data.segments.map((segment, index) => {
    const accent =
      STATUS_ACCENT[segment.status] ??
      FALLBACK_ACCENTS[index % FALLBACK_ACCENTS.length];
    return {
      status: segment.status,
      label: statusLabel(segment.status),
      count: segment.count,
      percentage: segment.percentage,
      accent,
      fill: accent
    };
  });

  const pieSlices = pieRows.filter((row) => row.count > 0);

  return (
    <Card className="flex h-full min-h-0 flex-col border-border/60 bg-card/80 backdrop-blur-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Library Health</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-center px-6 pb-6 pt-0">
        {data.total === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No data yet.
          </p>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square h-[210px] max-w-[210px] shrink-0 [&_.recharts-surface]:outline-none xl:h-[240px] xl:max-w-[240px]"
            >
              <PieChart margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={pieSlices}
                  dataKey="count"
                  nameKey="label"
                  innerRadius={52}
                  outerRadius={84}
                  strokeWidth={2}
                  stroke="hsl(var(--background))"
                >
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-foreground text-2xl font-bold"
                            >
                              {data.total.toLocaleString()}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy ?? 0) + 18}
                              className="fill-muted-foreground text-xs"
                            >
                              Total
                            </tspan>
                          </text>
                        );
                      }
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
            <ul className="flex w-full max-w-sm flex-col gap-2.5">
              {pieRows.map((row) => (
                <li
                  key={row.status}
                  className="flex items-center justify-between gap-4 text-sm"
                  style={{ color: row.accent }}
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span
                      className="h-3 w-3 shrink-0 rounded-full border border-background/40 shadow-sm"
                      style={{ backgroundColor: row.accent }}
                    />
                    <span className="font-medium">{row.label}</span>
                  </span>
                  <span className="shrink-0 tabular-nums">
                    <span>{row.count.toLocaleString()}</span>
                    <span className="opacity-90"> - </span>
                    <span>{row.percentage.toFixed(1)}%</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
