import QueryErrorState from "@/components/dashboard/QueryErrorState";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import type { DashboardKpis } from "@/types/statistic.type";

import {
  ArrowDown,
  ArrowUp,
  LayersIcon,
  type LucideIcon,
  Minus,
  PlayIcon,
  StarIcon,
  TrophyIcon
} from "lucide-react";

type Props = {
  data: DashboardKpis | undefined;
  isLoading: boolean;
  error: unknown | null;
  showTrends?: boolean;
};

const formatInt = (value: number) =>
  Math.round(value).toLocaleString(undefined, { maximumFractionDigits: 0 });

type TrendDirection = "up" | "down" | "flat";

type Trend = {
  direction: TrendDirection;
  label: string;
};

const trendPercent = (metric: DashboardKpis["totalMedia"]): Trend => {
  const raw = metric.changePercent;
  const direction: TrendDirection = raw > 0 ? "up" : raw < 0 ? "down" : "flat";
  return {
    direction,
    label: `${Math.abs(raw).toFixed(1)}%`
  };
};

const trendAbsolute = (
  metric: DashboardKpis["averagePersonalScore"]
): Trend => {
  const raw = metric.changeAbsolute;
  const direction: TrendDirection = raw > 0 ? "up" : raw < 0 ? "down" : "flat";
  return {
    direction,
    label: Math.abs(raw).toFixed(2)
  };
};

const trendTextClass = (direction: TrendDirection) => {
  if (direction === "up") return "text-emerald-400";
  if (direction === "flat") return "text-amber-400";
  return "text-rose-400";
};

type KpiItem = {
  title: string;
  value: string;
  trend: Trend;
  trendClass: string;
  icon: LucideIcon;
  circleClass: string;
  iconClass: string;
};

export default function KpiCards({
  data,
  isLoading,
  error,
  showTrends = true
}: Props) {
  if (error) {
    return (
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
        <Card className="border-border/60 bg-card/80 backdrop-blur-xl xl:col-span-4">
          <CardContent className="p-5">
            <QueryErrorState error={error} />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card
            key={index}
            className="border-border/60 bg-card/80 backdrop-blur-xl"
          >
            <CardContent className="flex flex-col gap-2 p-5 xl:flex-row xl:items-center xl:gap-4">
              <div className="flex items-center gap-3 xl:hidden">
                <Skeleton className="h-5 w-5 shrink-0 rounded-full" />
                <Skeleton className="h-4 w-28" />
              </div>
              <Skeleton className="hidden h-14 w-14 shrink-0 rounded-full xl:block" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="hidden h-4 w-28 xl:block" />
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-5 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const totalTrend = trendPercent(data.totalMedia);
  const inProgressTrend = trendPercent(data.inProgress);
  const avgTrend = trendAbsolute(data.averagePersonalScore);
  const topTrend = trendAbsolute(data.topRatedPersonalScore);

  const items: KpiItem[] = [
    {
      title: "Total media",
      value: formatInt(data.totalMedia.value),
      trend: totalTrend,
      trendClass: trendTextClass(totalTrend.direction),
      icon: LayersIcon,
      circleClass: "border-violet-500/45 bg-violet-950/50",
      iconClass: "text-violet-400"
    },
    {
      title: "In progress",
      value: formatInt(data.inProgress.value),
      trend: inProgressTrend,
      trendClass: trendTextClass(inProgressTrend.direction),
      icon: PlayIcon,
      circleClass: "border-sky-500/45 bg-sky-950/50",
      iconClass: "text-sky-400"
    },
    {
      title: "Average score (personal)",
      value: data.averagePersonalScore.value.toFixed(2),
      trend: avgTrend,
      trendClass: trendTextClass(avgTrend.direction),
      icon: StarIcon,
      circleClass: "border-amber-500/45 bg-amber-950/50",
      iconClass: "text-amber-400"
    },
    {
      title: "Top rated (personal)",
      value: data.topRatedPersonalScore.value.toFixed(2),
      trend: topTrend,
      trendClass: trendTextClass(topTrend.direction),
      icon: TrophyIcon,
      circleClass: "border-violet-500/45 bg-violet-950/50",
      iconClass: "text-violet-400"
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      {items.map((item) => {
        const TrendGlyph =
          item.trend.direction === "up"
            ? ArrowUp
            : item.trend.direction === "down"
              ? ArrowDown
              : Minus;
        const Icon = item.icon;

        return (
          <Card
            key={item.title}
            className="border-border/60 bg-card/80 backdrop-blur-xl"
          >
            <CardContent className="flex flex-col gap-2 p-5 xl:flex-row xl:items-center xl:gap-4">
              <div
                className={`hidden shrink-0 items-center justify-center rounded-full border xl:flex xl:h-14 xl:w-14 ${item.circleClass}`}
              >
                <Icon className={`h-7 w-7 ${item.iconClass}`} />
              </div>
              <div className="flex items-center gap-3 xl:hidden">
                <div
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${item.circleClass}`}
                >
                  <Icon className={`h-2.5 w-2.5 ${item.iconClass}`} />
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  {item.title}
                </p>
              </div>
              <div className="min-w-0 flex-1">
                <p className="hidden text-sm font-medium text-muted-foreground xl:block">
                  {item.title}
                </p>
                <p className="text-3xl font-semibold tabular-nums tracking-tight xl:mt-0.5">
                  {item.value}
                </p>
                {showTrends ? (
                  <div
                    className={`mt-1 flex items-center gap-1.5 text-sm font-semibold tabular-nums ${item.trendClass}`}
                  >
                    <TrendGlyph
                      className="h-4 w-4 shrink-0 stroke-[2.5] xl:h-5 xl:w-5"
                      aria-hidden
                    />
                    <span>{item.trend.label}</span>
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
