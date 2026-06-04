import QueryErrorState from "@/components/dashboard/QueryErrorState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";

import useWideScreen from "@/hooks/useWideScreen";

import type { MediaConsumption } from "@/types/statistic.type";

import { STATISTICS_VIEW } from "@/lib/enums";

import { Loader2Icon } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";

const chartConfig = {
  animeCount: {
    label: "Anime",
    color: "hsl(var(--chart-1))"
  },
  mangaCount: {
    label: "Manga",
    color: "hsl(var(--chart-2))"
  },
  lightNovelCount: {
    label: "Light Novel",
    color: "hsl(var(--chart-3))"
  }
} satisfies ChartConfig;

type MediaConsumptionCardProps = {
  year: string;
  data: MediaConsumption[] | undefined;
  isLoading: boolean;
  error: unknown | null;
};

export default function MediaConsumptionCard(props: MediaConsumptionCardProps) {
  const { year, data, isLoading, error } = props;
  const isWideScreen = useWideScreen();
  const isAllTime = year === "all";
  const effectiveView = isAllTime
    ? STATISTICS_VIEW.YEARLY
    : STATISTICS_VIEW.MONTHLY;

  const chartHeightClass = "h-[250px] w-full xl:h-[350px]";
  const series = data ?? [];

  return (
    <Card className="flex h-full min-h-0 w-full flex-col border-border/60 bg-card/80 backdrop-blur-xl">
      <CardHeader className="flex flex-col items-stretch justify-between gap-4 space-y-0 p-6 pb-4 xl:flex-row xl:items-center">
        <div className="flex flex-col justify-center">
          <CardTitle className="text-lg font-semibold leading-none tracking-tight">
            Media Consumption
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-center px-6 pb-6 pt-0">
        {error ? (
          <QueryErrorState error={error} />
        ) : isLoading ? (
          <div
            className={`flex ${chartHeightClass} items-center justify-center gap-2`}
          >
            <Loader2Icon className="h-4 w-4 animate-spin" />
            Loading chart...
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className={`aspect-auto ${chartHeightClass}`}
          >
            <LineChart accessibilityLayer data={series}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="period"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                angle={isWideScreen ? undefined : 45}
                interval="preserveStartEnd"
                tickFormatter={
                  effectiveView === STATISTICS_VIEW.YEARLY
                    ? undefined
                    : isWideScreen
                      ? undefined
                      : (value) => value.slice(0, 3)
                }
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Line
                type="monotone"
                dataKey="animeCount"
                fill="var(--color-animeCount)"
                stroke="var(--color-animeCount)"
              />
              <Line
                type="monotone"
                dataKey="mangaCount"
                fill="var(--color-mangaCount)"
                stroke="var(--color-mangaCount)"
              />
              <Line
                type="monotone"
                dataKey="lightNovelCount"
                fill="var(--color-lightNovelCount)"
                stroke="var(--color-lightNovelCount)"
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
