"use client";

import { useState } from "react";

import SortDirection from "@/components/filter-sort-dropdowns/SortDirection";
import LightNovelAdvancedFilters from "@/components/light-novel/LightNovelAdvancedFilters";
import LightNovelSearch from "@/components/light-novel/LightNovelSearch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { useLightNovelListHeader } from "@/hooks/useLightNovelListHeader";

import { SORT_ORDER } from "@/lib/enums";

import { ArrowLeftIcon, SlidersHorizontalIcon } from "lucide-react";
import Link from "next/link";

export default function LightNovelHeader() {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const {
    query,
    status,
    sort,
    order,
    lightNovelMetadata,
    statusFilters,
    activeFiltersCount,
    handleSort,
    handleStatus
  } = useLightNovelListHeader();

  return (
    <div className="sticky top-0 z-50 bg-white/20 backdrop-blur-xl border-b border-white/30">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-slate-800 hover:bg-white/20"
            >
              <Link href="/">
                <ArrowLeftIcon size={16} />
                Home
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Light Novel Readlist
              </h1>
              <p className="text-slate-700 text-sm">
                {lightNovelMetadata?.itemCount} of{" "}
                {statusFilters?.find((row) => row.label === "All")?.count} light
                novels
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
            <LightNovelSearch initialQuery={query} />
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <SortDirection
                sort={sort}
                order={order as SORT_ORDER}
                handleSort={handleSort}
              />

              <Button
                variant="outline"
                onClick={() => setShowAdvancedFilters((prev) => !prev)}
                className="bg-white/60 backdrop-blur-sm border-white/40 text-slate-800 hover:bg-white/80 relative"
              >
                <SlidersHorizontalIcon size={16} />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full p-0 flex items-center justify-center">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {statusFilters?.map((filter) => {
            return (
              <Button
                key={filter.label}
                variant={status === filter.value ? "default" : "ghost"}
                size="sm"
                onClick={() => handleStatus(filter.value)}
                className={
                  status === filter.value
                    ? "bg-slate-800 text-white hover:bg-slate-700 whitespace-nowrap"
                    : "text-slate-700 hover:bg-white/30 whitespace-nowrap"
                }
              >
                {filter.label}
                <Badge variant="secondary" className="ml-2 text-xs">
                  {filter.count}
                </Badge>
              </Button>
            );
          })}
        </div>

        {showAdvancedFilters && (
          <LightNovelAdvancedFilters
            setShowAdvancedFilters={setShowAdvancedFilters}
          />
        )}
      </div>
    </div>
  );
}
