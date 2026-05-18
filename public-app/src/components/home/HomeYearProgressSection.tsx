"use client";

import { Fragment, useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useHomeStatistics } from "@/hooks/useHomeStatistics";

import { Flower2Icon, Loader2Icon } from "lucide-react";
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const PIE_COLORS = {
  Anime: "hsl(340 78% 58%)",
  Manga: "hsl(268 78% 66%)",
  "Light Novels": "hsl(24 92% 62%)"
} as const;

const LINE_COLORS = {
  animeCount: "hsl(340 78% 58%)",
  mangaCount: "hsl(268 78% 66%)",
  lightNovelCount: "hsl(24 92% 62%)"
} as const;

type ChartTab = "overview" | "anime" | "manga" | "lightNovel";

const tabClassName =
  "rounded-lg px-4 text-xs text-[#4b3a4c] data-[state=active]:bg-rose-50 data-[state=active]:text-rose-600";

export default function HomeYearProgressSection() {
  const { topMediasQuery, mediaConsumptionQuery } = useHomeStatistics();
  const year = new Date().getFullYear();
  const [chartTab, setChartTab] = useState<ChartTab>("overview");

  const isLoading = topMediasQuery.isLoading || mediaConsumptionQuery.isLoading;
  const isError = topMediasQuery.isError || mediaConsumptionQuery.isError;

  const animeCount = topMediasQuery.data?.anime.count ?? 0;
  const mangaCount = topMediasQuery.data?.manga.count ?? 0;
  const lightNovelCount = topMediasQuery.data?.lightNovel.count ?? 0;
  const totalStories = animeCount + mangaCount + lightNovelCount;

  const pieData = [
    { name: "Anime" as const, value: animeCount },
    { name: "Manga" as const, value: mangaCount },
    { name: "Light Novels" as const, value: lightNovelCount }
  ].filter((row) => row.value > 0);

  const chartData = mediaConsumptionQuery.data ?? [];

  const legendItems = [
    {
      name: "Anime",
      color: PIE_COLORS["Anime"],
      pct:
        totalStories > 0 ? ((animeCount / totalStories) * 100).toFixed(1) : "0"
    },
    {
      name: "Manga",
      color: PIE_COLORS["Manga"],
      pct:
        totalStories > 0 ? ((mangaCount / totalStories) * 100).toFixed(1) : "0"
    },
    {
      name: "Light Novels",
      color: PIE_COLORS["Light Novels"],
      pct:
        totalStories > 0
          ? ((lightNovelCount / totalStories) * 100).toFixed(1)
          : "0"
    }
  ];

  const showAnime = chartTab === "overview" || chartTab === "anime";
  const showManga = chartTab === "overview" || chartTab === "manga";
  const showLightNovel = chartTab === "overview" || chartTab === "lightNovel";

  return (
    <section className="relative z-20 -mt-40 bg-transparent pb-0 pt-0 lg:-mt-44">
      <div className="mx-auto box-border w-full max-w-[1400px] px-4 sm:px-8 lg:px-12">
        <Card className="mx-auto w-full max-w-[calc(100vw-2rem)] border-white/80 bg-white/85 shadow-[0_24px_80px_rgba(244,114,182,0.22)] backdrop-blur-xl sm:max-w-6xl">
          <CardContent className="p-5 lg:p-6">
            <div className="mb-4">
              <h2 className="flex items-center gap-2 text-2xl font-bold text-[#4a1630]">
                <Flower2Icon className="h-5 w-5 text-rose-400" aria-hidden />
                {year} Progress
              </h2>
              <p className="mt-2 text-sm text-[#5d4d5e] sm:text-base">
                My journey through anime, manga, and light novels this year.
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
              <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
                <div className="flex min-w-0 flex-col items-center justify-center gap-4 sm:flex-row">
                  {pieData.length === 0 ? (
                    <div className="flex h-[250px] w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-rose-100 bg-white/60 text-center text-sm text-[#6b5b6b]">
                      <span className="text-3xl font-bold text-rose-300">
                        0
                      </span>
                      <span>No series logged this year yet.</span>
                    </div>
                  ) : (
                    <Fragment>
                      <div className="relative h-[165px] w-full max-w-[170px] shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={pieData}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              innerRadius="55%"
                              outerRadius="90%"
                              paddingAngle={3}
                              strokeWidth={2}
                              stroke="hsl(0 0% 100%)"
                              isAnimationActive={false}
                            >
                              {pieData.map((entry) => {
                                return (
                                  <Cell
                                    key={entry.name}
                                    fill={PIE_COLORS[entry.name]}
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
                        </ResponsiveContainer>
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-3xl font-bold tabular-nums text-[#4a1630]">
                              {totalStories}
                            </div>
                            <div className="text-xs font-medium text-[#6b5b6b]">
                              Total
                              <br />
                              Stories
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex min-w-[115px] flex-col gap-3">
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

                <div className="min-w-0">
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Tabs
                      value={chartTab}
                      onValueChange={(value) => setChartTab(value as ChartTab)}
                    >
                      <TabsList className="h-9 gap-1 bg-transparent p-0">
                        <TabsTrigger value="overview" className={tabClassName}>
                          Overview
                        </TabsTrigger>
                        <TabsTrigger value="anime" className={tabClassName}>
                          Anime
                        </TabsTrigger>
                        <TabsTrigger value="manga" className={tabClassName}>
                          Manga
                        </TabsTrigger>
                        <TabsTrigger
                          value="lightNovel"
                          className={tabClassName}
                        >
                          Light Novels
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                    <span className="inline-flex w-fit items-center gap-1 rounded-lg border border-rose-100 bg-white/75 px-3 py-1.5 text-xs font-semibold text-[#4b3a4c]">
                      This Year
                      <svg
                        className="h-3.5 w-3.5 text-rose-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </span>
                  </div>
                  <div className="h-[155px] w-full min-w-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={chartData}
                        margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
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
                        {showAnime && (
                          <Line
                            type="monotone"
                            dataKey="animeCount"
                            name="Anime"
                            stroke={LINE_COLORS.animeCount}
                            strokeWidth={2.5}
                            dot={{ r: 4, fill: LINE_COLORS.animeCount }}
                            activeDot={{ r: 6 }}
                            isAnimationActive={false}
                          />
                        )}
                        {showManga && (
                          <Line
                            type="monotone"
                            dataKey="mangaCount"
                            name="Manga"
                            stroke={LINE_COLORS.mangaCount}
                            strokeWidth={2.5}
                            dot={{ r: 4, fill: LINE_COLORS.mangaCount }}
                            activeDot={{ r: 6 }}
                            isAnimationActive={false}
                          />
                        )}
                        {showLightNovel && (
                          <Line
                            type="monotone"
                            dataKey="lightNovelCount"
                            name="Light Novels"
                            stroke={LINE_COLORS.lightNovelCount}
                            strokeWidth={2.5}
                            dot={{
                              r: 4,
                              fill: LINE_COLORS.lightNovelCount
                            }}
                            activeDot={{ r: 6 }}
                            isAnimationActive={false}
                          />
                        )}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
