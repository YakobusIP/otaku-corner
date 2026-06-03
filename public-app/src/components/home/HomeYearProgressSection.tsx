"use client";

import { Fragment, useMemo, useState } from "react";

import MeasuredRechartsContainer from "@/components/charts/MeasuredRechartsContainer";
import SlideUpInView from "@/components/motion/SlideUpInView";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useHomeYearProgressStatistics } from "@/hooks/useHomeYearProgressStatistics";

import {
  HOME_PROGRESS_CHART_TABS,
  type HomeProgressChartTab,
  PUBLIC_MEDIA_TYPES,
  PUBLIC_MEDIA_TYPE_CONFIG,
  getChartPieColor
} from "@/lib/media/public-media-type";

import { motion } from "framer-motion";
import { FlowerIcon, Loader2Icon } from "lucide-react";
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const chartTabHighlightTransition = {
  type: "spring" as const,
  stiffness: 420,
  damping: 34
};

const chartFilterButtonClassName =
  "relative z-10 h-auto shrink-0 rounded-lg px-4 py-1.5 text-xs font-medium text-[#4b3a4c] shadow-none hover:bg-transparent focus-visible:ring-rose-200 aria-pressed:text-rose-600";

const lineSeries = PUBLIC_MEDIA_TYPES.map((mediaTypeId) => {
  const config = PUBLIC_MEDIA_TYPE_CONFIG[mediaTypeId];
  return {
    dataKey: config.chartLineDataKey,
    name: config.chartLineName,
    tab: mediaTypeId,
    stroke: config.chartColor
  };
});

export default function HomeYearProgressSection() {
  const thisCalendarYear = new Date().getFullYear();
  const [progressYear, setProgressYear] = useState(thisCalendarYear);
  const { topMediasQuery, mediaConsumptionQuery, yearRangeQuery } =
    useHomeYearProgressStatistics(progressYear);
  const [chartTab, setChartTab] = useState<HomeProgressChartTab>("all");

  const years = useMemo(() => {
    const range = yearRangeQuery.data ?? [];
    const base = range.length > 0 ? [...range] : [thisCalendarYear];
    if (!base.includes(thisCalendarYear)) {
      base.push(thisCalendarYear);
    }
    return [...new Set(base)].sort((a, b) => a - b);
  }, [yearRangeQuery.data, thisCalendarYear]);

  const isLoading = topMediasQuery.isLoading || mediaConsumptionQuery.isLoading;
  const isError = topMediasQuery.isError || mediaConsumptionQuery.isError;

  const mediaCounts = PUBLIC_MEDIA_TYPES.map((mediaTypeId) => {
    return topMediasQuery.data?.[mediaTypeId].count ?? 0;
  });

  const totalStories = mediaCounts.reduce((sum, count) => sum + count, 0);

  const pieData = PUBLIC_MEDIA_TYPES.map((mediaTypeId, index) => {
    const config = PUBLIC_MEDIA_TYPE_CONFIG[mediaTypeId];
    return {
      name: config.chartPieLegendName,
      value: mediaCounts[index]
    };
  }).filter((row) => row.value > 0);

  const chartData = mediaConsumptionQuery.data ?? [];

  const legendItems = PUBLIC_MEDIA_TYPES.map((mediaTypeId, index) => {
    const config = PUBLIC_MEDIA_TYPE_CONFIG[mediaTypeId];
    const count = mediaCounts[index];
    return {
      name: config.chartPieLegendName,
      color: config.chartColor,
      pct: totalStories > 0 ? ((count / totalStories) * 100).toFixed(1) : "0"
    };
  });

  return (
    <SlideUpInView
      as="section"
      className="relative z-20 -mt-40 bg-transparent pb-0 pt-0 lg:-mt-44"
    >
      <div className="mx-auto box-border w-full max-w-[1540px] px-4 pt-16 pb-8 sm:px-8 sm:pt-20 sm:pb-10 lg:px-12 lg:pt-28 lg:pb-14">
        <Card className="w-full border-white/80 bg-white/85 shadow-[0_24px_80px_rgba(244,114,182,0.22)] backdrop-blur-xl">
          <CardContent className="p-5 lg:p-6">
            <div className="mb-4">
              <h2 className="flex items-center gap-2 text-2xl font-bold text-[#4a1630]">
                <FlowerIcon className="h-5 w-5 text-rose-400" aria-hidden />
                {progressYear} Progress
              </h2>
              <p className="mt-2 text-sm text-[#5d4d5e] sm:text-base">
                My journey through anime, manga, and light novels in{" "}
                {progressYear}.
              </p>
            </div>

            {isError ? (
              <p className="py-12 text-center text-sm text-[#6b5b6b]">
                Could not load progress charts. Please try again later.
              </p>
            ) : isLoading ? (
              <div className="flex min-h-[320px] items-center justify-center gap-2 text-[#6b5b6b]">
                <Loader2Icon className="h-5 w-5 animate-spin" />
                Loading charts...
              </div>
            ) : (
              <div className="grid min-w-0 gap-6 lg:grid-cols-[40%_60%]">
                <div className="flex min-w-0 flex-col items-center justify-center gap-4 sm:flex-row">
                  {pieData.length === 0 ? (
                    <div className="flex h-[280px] w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-rose-100 bg-white/60 text-center text-sm text-[#6b5b6b]">
                      <span className="text-3xl font-bold text-rose-300">
                        0
                      </span>
                      <span>No series logged in {progressYear} yet.</span>
                    </div>
                  ) : (
                    <Fragment>
                      <div className="relative w-full min-w-0 max-w-[240px] shrink-0">
                        <MeasuredRechartsContainer className="h-[220px] w-full min-w-0">
                          {({ width, height }) => {
                            return (
                              <PieChart width={width} height={height}>
                                <Pie
                                  data={pieData}
                                  dataKey="value"
                                  nameKey="name"
                                  cx="50%"
                                  cy="50%"
                                  innerRadius="72%"
                                  outerRadius="92%"
                                  paddingAngle={3}
                                  strokeWidth={2}
                                  stroke="hsl(0 0% 100%)"
                                  animationDuration={1050}
                                >
                                  {pieData.map((entry) => {
                                    return (
                                      <Cell
                                        key={entry.name}
                                        fill={getChartPieColor(entry.name)}
                                      />
                                    );
                                  })}
                                </Pie>
                                <Tooltip
                                  formatter={(value, name) => {
                                    return [
                                      `${value ?? 0}`,
                                      typeof name === "string" ? name : ""
                                    ];
                                  }}
                                />
                              </PieChart>
                            );
                          }}
                        </MeasuredRechartsContainer>
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-4xl font-bold tabular-nums text-[#4a1630]">
                              {totalStories}
                            </div>
                            <div className="text-sm font-medium text-[#6b5b6b]">
                              Total
                              <br />
                              Stories
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex min-w-[120px] flex-1 flex-col gap-3 sm:min-w-[130px]">
                        {legendItems.map((item) => {
                          return (
                            <div
                              key={item.name}
                              className="flex items-center justify-between gap-3 text-sm"
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className="inline-block h-3 w-3 rounded-full"
                                  style={{ backgroundColor: item.color }}
                                />
                                <span className="font-medium text-[#3f2b40]">
                                  {item.name}
                                </span>
                              </div>
                              <span className="tabular-nums text-[#4b3a4c]">
                                {item.pct}%
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </Fragment>
                  )}
                </div>

                <div className="min-w-0 pl-0 pr-4 sm:pr-5 lg:pr-6">
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div
                      role="group"
                      aria-label="Line chart series"
                      className="relative flex h-auto min-h-9 w-full max-w-full flex-wrap items-center justify-center gap-1 sm:inline-flex sm:h-9 sm:w-auto sm:max-w-none sm:justify-start"
                    >
                      {HOME_PROGRESS_CHART_TABS.map(({ value, label }) => {
                        const isActive = chartTab === value;

                        return (
                          <Button
                            key={value}
                            type="button"
                            variant="ghost"
                            size="sm"
                            aria-pressed={isActive}
                            className={chartFilterButtonClassName}
                            onClick={() => {
                              setChartTab(value);
                            }}
                          >
                            {isActive ? (
                              <motion.span
                                layoutId="home-year-progress-chart-tab-highlight"
                                aria-hidden
                                className="pointer-events-none absolute inset-0 z-0 rounded-lg bg-rose-50 shadow-none"
                                transition={chartTabHighlightTransition}
                              />
                            ) : null}
                            <span className="relative z-10">{label}</span>
                          </Button>
                        );
                      })}
                    </div>
                    <div className="flex flex-col gap-1 sm:items-end">
                      <span className="sr-only" id="home-progress-year-label">
                        Year for charts and totals
                      </span>
                      <Select
                        value={String(progressYear)}
                        disabled={yearRangeQuery.isLoading}
                        onValueChange={(value) => {
                          setProgressYear(Number(value));
                        }}
                      >
                        <SelectTrigger
                          aria-labelledby="home-progress-year-label"
                          className="h-9 w-fit min-w-30 gap-1 rounded-lg border-rose-100 bg-white/75 px-3 py-1.5 text-xs font-semibold text-[#4b3a4c] shadow-none hover:bg-white/90 focus:ring-rose-200 disabled:opacity-60 [&_svg]:h-3.5 [&_svg]:w-3.5 [&_svg]:text-rose-300 [&_svg]:opacity-100"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent align="end">
                          {years.map((choiceYear) => {
                            return (
                              <SelectItem
                                key={choiceYear}
                                value={String(choiceYear)}
                              >
                                {choiceYear === thisCalendarYear
                                  ? "This year"
                                  : String(choiceYear)}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <MeasuredRechartsContainer className="h-[180px] w-full min-w-0">
                    {({ width, height }) => {
                      return (
                        <LineChart
                          width={width}
                          height={height}
                          data={chartData}
                          margin={{ top: 8, right: 20, left: 4, bottom: 4 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical
                            stroke="hsl(340 74% 92%)"
                          />
                          <XAxis
                            dataKey="period"
                            tickLine={false}
                            axisLine={false}
                            tick={{
                              fill: "hsl(312 17% 35%)",
                              fontSize: 11
                            }}
                            tickFormatter={(value: string) => value.slice(0, 3)}
                            interval="preserveStartEnd"
                          />
                          <YAxis
                            allowDecimals={false}
                            width={32}
                            tickLine={false}
                            axisLine={false}
                            tick={{
                              fill: "hsl(312 17% 35%)",
                              fontSize: 11
                            }}
                          />
                          <Tooltip
                            contentStyle={{
                              borderRadius: 12,
                              border: "1px solid hsl(340 74% 92%)",
                              fontSize: 13
                            }}
                          />
                          {lineSeries.map((series) => {
                            if (chartTab !== "all" && chartTab !== series.tab) {
                              return null;
                            }
                            return (
                              <Line
                                key={series.dataKey}
                                type="monotone"
                                dataKey={series.dataKey}
                                name={series.name}
                                stroke={series.stroke}
                                strokeWidth={2.5}
                                dot={{ r: 4, fill: series.stroke }}
                                activeDot={{ r: 6 }}
                                animationDuration={1350}
                              />
                            );
                          })}
                        </LineChart>
                      );
                    }}
                  </MeasuredRechartsContainer>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SlideUpInView>
  );
}
