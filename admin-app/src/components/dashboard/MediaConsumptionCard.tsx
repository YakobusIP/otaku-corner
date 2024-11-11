import { useCallback, useEffect, useRef, useState } from "react";

import {
  fetchMediaConsumptionService,
  fetchYearRangeService
} from "@/services/statistic.service";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

import { useToast } from "@/hooks/useToast";
import useWideScreen from "@/hooks/useWideScreen";

import { MediaConsumption } from "@/types/statistic.type";

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

export default function MediaConsumptionCard() {
  const isWideScreen = useWideScreen();
  const toast = useToast();
  const toastRef = useRef(toast.toast);

  const [view, setView] = useState(STATISTICS_VIEW.MONTHLY);
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [yearRange, setYearRange] = useState<number[]>([]);
  const [mediaConsumption, setMediaConsumption] = useState<MediaConsumption[]>(
    []
  );
  const [isLoadingYearRange, setIsLoadingYearRange] = useState(false);
  const [isLoadingMediaConsumption, setIsLoadingMediaConsumption] =
    useState(false);

  const fetchYearRange = useCallback(async () => {
    setIsLoadingYearRange(true);
    const response = await fetchYearRangeService();
    if (response.success) {
      setYearRange(response.data);
    } else {
      toastRef.current({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: response.error
      });
    }
    setIsLoadingYearRange(false);
  }, []);

  const fetchMediaConsumptionData = useCallback(async () => {
    setIsLoadingMediaConsumption(true);
    const response = await fetchMediaConsumptionService(view, year);
    if (response.success) {
      setMediaConsumption(response.data);
    } else {
      toastRef.current({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: response.error
      });
    }
    setIsLoadingMediaConsumption(false);
  }, [view, year]);

  useEffect(() => {
    fetchYearRange();
  }, [fetchYearRange]);

  useEffect(() => {
    fetchMediaConsumptionData();
  }, [fetchMediaConsumptionData]);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col items-stretch justify-between space-y-0 p-0 2xl:flex-row">
        <div className="flex flex-col justify-center gap-1 px-6 py-5 2xl:py-6">
          <CardTitle>Media Consumption</CardTitle>
          <CardDescription>Medias consumed over the year</CardDescription>
        </div>
        <div className="flex flex-col xl:flex-row items-center justify-center gap-4 px-6 py-2 2xl:py-6">
          <div className="flex items-center justify-center gap-4">
            <Label>View</Label>
            <Select
              value={view}
              onValueChange={(value) => setView(value as STATISTICS_VIEW)}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(STATISTICS_VIEW).map((rating) => {
                  return (
                    <SelectItem key={rating} value={rating.toString()}>
                      {rating}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          {view === STATISTICS_VIEW.MONTHLY && (
            <div className="flex items-center justify-center gap-4">
              <Label>Year</Label>
              <Select
                defaultValue={new Date().getFullYear().toString()}
                value={year}
                onValueChange={(value) => setYear(value)}
              >
                <SelectTrigger className="w-[150px]">
                  {isLoadingYearRange ? (
                    <>
                      <div className="flex items-center justify-center gap-2">
                        <Loader2Icon className="w-4 h-4 animate-spin" />
                        Loading...
                      </div>
                    </>
                  ) : (
                    <SelectValue />
                  )}
                </SelectTrigger>
                <SelectContent>
                  {yearRange.map((year) => {
                    return (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoadingMediaConsumption ? (
          <div className="flex items-center justify-center h-[250px] xl:h-[350px] gap-2">
            <Loader2Icon className="h-4 w-4 animate-spin" />
            Loading chart...
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] xl:h-[350px] w-full"
          >
            <LineChart accessibilityLayer data={mediaConsumption}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="period"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                angle={isWideScreen ? undefined : 45}
                interval="preserveStartEnd"
                tickFormatter={
                  isWideScreen && view === STATISTICS_VIEW.YEARLY
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
