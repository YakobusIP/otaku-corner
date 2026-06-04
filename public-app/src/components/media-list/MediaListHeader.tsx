"use client";

import { useState } from "react";

import SortDirection from "@/components/filter-sort-dropdowns/SortDirection";
import MediaListAdvancedFilters from "@/components/media-list/MediaListAdvancedFilters";
import MediaListSearch from "@/components/media-list/MediaListSearch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

import { MOBILE_MEDIA_QUERY, useMediaQuery } from "@/hooks/useMediaQuery";
import { useMediaListHeader } from "@/hooks/useMediaListHeader";

import type { MediaListClientConfig } from "@/types/context.type";

import { SORT_ORDER } from "@/lib/shared/enums";
import { cn } from "@/lib/shared/utils";

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

type Props<
  TItem extends { id: number },
  TFilters extends Record<string, unknown>,
  TListFilters extends Record<string, unknown>,
  TInfiniteQueryKey extends readonly unknown[]
> = {
  config: MediaListClientConfig<TItem, TFilters, TListFilters, TInfiniteQueryKey>;
};

export default function MediaListHeader<
  TItem extends { id: number },
  TFilters extends Record<string, unknown>,
  TListFilters extends Record<string, unknown>,
  TInfiniteQueryKey extends readonly unknown[]
>({ config }: Props<TItem, TFilters, TListFilters, TInfiniteQueryKey>) {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const isMobile = useMediaQuery(MOBILE_MEDIA_QUERY);
  const prefersReducedMotion = useReducedMotion();

  const {
    status,
    sort,
    order,
    metadata,
    statusFilters,
    allTabCount,
    activeFiltersCount,
    handleSort,
    handleStatus
  } = useMediaListHeader(config);

  const headerInner = (
    <div className="container mx-auto py-4">
      <div className="mb-4 flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
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
              {config.header.title}
            </h1>
            <p className="text-slate-700 text-sm">
              {metadata?.itemCount} of {allTabCount} {config.header.countNoun}
            </p>
          </div>
        </div>

        <div className="flex w-full min-w-0 flex-row items-center gap-2 lg:w-auto">
          <div className="min-w-0 flex-1 lg:flex-none lg:w-48 2xl:w-64">
            <MediaListSearch config={config} />
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <SortDirection
              sort={sort}
              order={order as SORT_ORDER}
              handleSort={handleSort}
              compactBelowMd
            />

            <Button
              variant="outline"
              aria-label="Filters"
              onClick={() => setShowAdvancedFilters((prev) => !prev)}
              className="relative size-10 shrink-0 px-0 border-white/40 bg-white/60 text-slate-800 backdrop-blur-sm hover:bg-white/80 md:h-10 md:w-auto md:px-4"
            >
              <SlidersHorizontalIcon size={16} />
              <span className="hidden md:inline">Filters</span>
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
        <LayoutGroup id={config.header.layoutGroupId}>
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
                    "relative z-10 whitespace-nowrap",
                    isActive
                      ? activeStatusButtonClass
                      : "text-slate-700 hover:bg-white/30"
                  )}
                >
                  {isActive ? (
                    <motion.span
                      layoutId={config.header.statusHighlightLayoutId}
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
            <MediaListAdvancedFilters
              config={config}
              layout="dialog"
              setShowAdvancedFilters={setShowAdvancedFilters}
            />
          </DialogContent>
        </Dialog>
      ) : (
        showAdvancedFilters && (
          <MediaListAdvancedFilters
            config={config}
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
