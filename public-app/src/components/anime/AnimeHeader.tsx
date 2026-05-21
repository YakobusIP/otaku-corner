"use client";

import { useState } from "react";

import AnimeAdvancedFilters from "@/components/anime/AnimeAdvancedFilters";
import AnimeSearch from "@/components/anime/AnimeSearch";
import SortDirection from "@/components/filter-sort-dropdowns/SortDirection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

import { useAnimeListHeader } from "@/hooks/useAnimeListHeader";
import { useIsMobile } from "@/hooks/useIsMobile";

import { SORT_ORDER } from "@/lib/enums";
import { cn } from "@/lib/utils";

import { LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { ArrowLeftIcon, SlidersHorizontalIcon } from "lucide-react";
import Link from "next/link";

const headerClassName =
  "sticky top-0 z-50 bg-white/20 backdrop-blur-xl border-b border-white/30";

const headerEntranceTransition = {
  duration: 0.9,
  ease: [0.22, 1, 0.36, 1] as const
};

const slidingTabHighlightTransition = {
  type: "spring" as const,
  stiffness: 420,
  damping: 34
};

const activeStatusButtonClass = "text-white hover:!text-white";

export default function AnimeHeader() {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const isMobile = useIsMobile();
  const prefersReducedMotion = useReducedMotion();

  const {
    query,
    status,
    sort,
    order,
    animeMetadata,
    statusFilters,
    activeFiltersCount,
    handleSort,
    handleStatus
  } = useAnimeListHeader();

  const headerInner = (
    <div className="container mx-auto py-4">
      <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
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
              Anime Watchlist
            </h1>
            <p className="text-slate-700 text-sm">
              {animeMetadata?.itemCount} of{" "}
              {statusFilters?.find((row) => row.label === "All")?.count} animes
            </p>
          </div>
        </div>

        <div className="flex w-full flex-col items-start gap-3 sm:w-auto sm:flex-row sm:items-center">
          <AnimeSearch initialQuery={query} />
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <SortDirection
              sort={sort}
              order={order as SORT_ORDER}
              handleSort={handleSort}
            />

            <Button
              variant="outline"
              onClick={() => setShowAdvancedFilters((prev) => !prev)}
              className="relative border-white/40 bg-white/60 text-slate-800 backdrop-blur-sm hover:bg-white/80 hover:cursor-pointer"
            >
              <SlidersHorizontalIcon size={16} />
              Filters
              {activeFiltersCount > 0 && (
                <Badge className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 p-0 text-xs text-white">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto pb-2">
        <LayoutGroup id="anime-status-tabs">
          <motion.div
            layoutRoot
            className="relative inline-flex min-w-min items-center gap-2"
          >
            {statusFilters?.map((filter) => {
              const isActive = status === filter.value;
              return (
                <Button
                  key={filter.label}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleStatus(filter.value)}
                  className={cn(
                    "relative z-10 whitespace-nowrap hover:cursor-pointer",
                    isActive
                      ? activeStatusButtonClass
                      : "text-slate-700 hover:bg-white/30"
                  )}
                >
                  {isActive ? (
                    <motion.span
                      layoutId="anime-status-highlight"
                      initial={false}
                      aria-hidden
                      className="pointer-events-none absolute inset-0 z-0 rounded-md bg-slate-800 shadow-xs"
                      transition={slidingTabHighlightTransition}
                    />
                  ) : null}
                  <span className="relative z-10">{filter.label}</span>
                  {isActive ? (
                    <Badge variant="secondary" className="relative z-10 ml-2">
                      {filter.count}
                    </Badge>
                  ) : null}
                </Button>
              );
            })}
          </motion.div>
        </LayoutGroup>
      </div>

      {isMobile ? (
        <Dialog
          open={showAdvancedFilters}
          onOpenChange={setShowAdvancedFilters}
        >
          <DialogContent
            className="fixed inset-0 left-0 top-0 z-50 flex h-dvh w-full max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-0 bg-white/95 p-0 shadow-none backdrop-blur-xl data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom data-[state=closed]:zoom-out-100 data-[state=open]:zoom-in-100"
            aria-describedby={undefined}
          >
            <DialogTitle className="sr-only">Advanced Filters</DialogTitle>
            <AnimeAdvancedFilters
              layout="dialog"
              setShowAdvancedFilters={setShowAdvancedFilters}
            />
          </DialogContent>
        </Dialog>
      ) : (
        showAdvancedFilters && (
          <AnimeAdvancedFilters
            setShowAdvancedFilters={setShowAdvancedFilters}
          />
        )
      )}
    </div>
  );

  if (prefersReducedMotion) {
    return <div className={headerClassName}>{headerInner}</div>;
  }

  return (
    <motion.header
      className={headerClassName}
      initial={{ opacity: 0, y: -22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={headerEntranceTransition}
    >
      {headerInner}
    </motion.header>
  );
}
