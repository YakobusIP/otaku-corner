import { useEffect, useMemo, useState } from "react";

import KpiCards from "@/components/dashboard/KpiCards";
import LibraryHealthCard from "@/components/dashboard/LibraryHealthCard";
import MediaConsumptionCard from "@/components/dashboard/MediaConsumptionCard";
import RecentActivity from "@/components/dashboard/RecentActivity";
import TasteProfileCard from "@/components/dashboard/TasteProfileCard";
import TopRatedSection from "@/components/dashboard/TopRatedSection";
import AdminLayout from "@/components/layout/AdminLayout";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

import {
  type DashboardYearScope,
  useDashboardQueries
} from "@/hooks/useDashboardQueries";

export default function Dashboard() {
  const currentYear = new Date().getFullYear();
  const [yearScope, setYearScope] = useState<DashboardYearScope>(currentYear);

  const {
    yearRangeQuery,
    kpisQuery,
    topRatedQuery,
    libraryHealthQuery,
    tasteProfileQuery,
    recentReviewsQuery,
    mediaConsumptionQuery
  } = useDashboardQueries(yearScope, {
    tasteProfileLimit: 10,
    recentReviewsLimit: 5
  });

  const { data: yearRange = [], isLoading: yearRangeLoading } = yearRangeQuery;

  const years = useMemo(() => {
    const base = yearRange.length > 0 ? [...yearRange] : [currentYear];
    if (!base.includes(currentYear)) {
      base.push(currentYear);
    }
    return [...new Set(base)].sort((a, b) => a - b);
  }, [yearRange, currentYear]);

  useEffect(() => {
    document.title = "Dashboard | Otaku Corner Admin";
  }, []);

  const selectValue = yearScope === "all" ? "all" : yearScope.toString();

  const yearSelect = (
    <div className="flex items-center gap-2">
      <Label htmlFor="dashboard-year" className="sr-only">
        Year
      </Label>
      <Select
        value={selectValue}
        onValueChange={(value) => {
          if (value === "all") {
            setYearScope("all");
          } else {
            setYearScope(Number(value));
          }
        }}
        disabled={yearRangeLoading}
      >
        <SelectTrigger id="dashboard-year" className="w-[140px]">
          <SelectValue placeholder={selectValue} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All time</SelectItem>
          {years.map((y) => (
            <SelectItem key={y} value={y.toString()}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  const consumptionYear = yearScope === "all" ? "all" : yearScope.toString();

  return (
    <AdminLayout
      title="Dashboard"
      description="Systematic overview of your anime, manga, and light novel library."
      actions={yearSelect}
    >
      <div className="flex flex-col gap-6">
        <KpiCards
          data={kpisQuery.data}
          isLoading={kpisQuery.isLoading}
          error={kpisQuery.isError ? kpisQuery.error : null}
          showTrends={yearScope !== "all"}
        />

        <div className="grid grid-cols-1 items-stretch gap-4 xl:grid-cols-[2fr_3fr]">
          <div className="flex min-h-0">
            <TopRatedSection
              data={topRatedQuery.data}
              isLoading={topRatedQuery.isLoading}
              error={topRatedQuery.isError ? topRatedQuery.error : null}
              allTime={yearScope === "all"}
            />
          </div>
          <div className="flex min-h-0">
            <MediaConsumptionCard
              year={consumptionYear}
              data={mediaConsumptionQuery.data}
              isLoading={mediaConsumptionQuery.isLoading}
              error={
                mediaConsumptionQuery.isError
                  ? mediaConsumptionQuery.error
                  : null
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 [&>*:nth-child(3)]:md:col-span-2 [&>*:nth-child(3)]:xl:col-span-1">
          <LibraryHealthCard
            data={libraryHealthQuery.data}
            isLoading={libraryHealthQuery.isLoading}
            error={libraryHealthQuery.isError ? libraryHealthQuery.error : null}
          />
          <TasteProfileCard
            data={tasteProfileQuery.data}
            isLoading={tasteProfileQuery.isLoading}
            error={tasteProfileQuery.isError ? tasteProfileQuery.error : null}
          />
          <RecentActivity
            items={recentReviewsQuery.data}
            isLoading={recentReviewsQuery.isLoading}
            error={recentReviewsQuery.isError ? recentReviewsQuery.error : null}
          />
        </div>
      </div>
    </AdminLayout>
  );
}
