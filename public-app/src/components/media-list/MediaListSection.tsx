"use client";

import { Fragment, ReactNode, useCallback, useRef } from "react";

import EntityQueryErrorToasts from "@/components/media-list/EntityQueryErrorToasts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { useGridColumnCount } from "@/hooks/useGridColumnCount";
import { useMediaListBody } from "@/hooks/useMediaListBody";

import type { MediaListClientConfig } from "@/types/context.type";

import { getCardStaggerDelay } from "@/lib/grid-stagger";

import { motion, useReducedMotion } from "framer-motion";
import { CompassIcon, FilterXIcon, XIcon } from "lucide-react";
import Image from "next/image";
import { useInView } from "react-intersection-observer";

const cardEntranceEase = [0.22, 1, 0.36, 1] as const;

type Props<
  TItem extends { id: number },
  TFilters extends Record<string, unknown>,
  TListFilters extends Record<string, unknown>,
  TInfiniteQueryKey extends readonly unknown[]
> = {
  config: MediaListClientConfig<
    TItem,
    TFilters,
    TListFilters,
    TInfiniteQueryKey
  >;
};

export default function MediaListSection<
  TItem extends { id: number },
  TFilters extends Record<string, unknown>,
  TListFilters extends Record<string, unknown>,
  TInfiniteQueryKey extends readonly unknown[]
>({ config }: Props<TItem, TFilters, TListFilters, TInfiniteQueryKey>) {
  const prefersReducedMotion = useReducedMotion();
  const columnCount = useGridColumnCount();

  const {
    query,
    filters,
    setQuery,
    itemList,
    metadata,
    isPending,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    entityLists,
    entityQueryErrors,
    removeFilter,
    clearAllFilters,
    browseAll,
    activeFiltersCount,
    loadingDots
  } = useMediaListBody(config);

  const loadMoreSnapshotRef = useRef({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage
  });
  loadMoreSnapshotRef.current = {
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage
  };

  const fetchNextIfNeeded = useCallback(() => {
    const snapshot = loadMoreSnapshotRef.current;
    if (!snapshot.hasNextPage || snapshot.isFetchingNextPage) return;
    void snapshot.fetchNextPage();
  }, []);

  const { ref: loadMoreRef } = useInView({
    skip: !hasNextPage,
    rootMargin: "0px 0px 72px 0px",
    threshold: 0,
    initialInView: false,
    onChange: (visible) => {
      if (!visible) return;
      fetchNextIfNeeded();
    }
  });

  return (
    <div className="container mx-auto flex flex-1 flex-col py-8">
      <EntityQueryErrorToasts errors={entityQueryErrors} />
      {(query || activeFiltersCount > 0) && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="text-slate-700">
            Showing {metadata?.itemCount} results
          </span>
          {query && (
            <Badge
              variant="outline"
              className="bg-white/60 text-slate-700 border-white/40"
            >
              Search: &quot;{query}&quot;
              <button
                className="ml-2 hover:text-slate-900"
                onClick={() => setQuery("")}
              >
                <XIcon size={12} />
              </button>
            </Badge>
          )}

          {config.activeFilterChips.map((chip) => {
            const filterValue = filters[chip.key];
            if (filterValue === undefined) return null;

            const chipText = String(filterValue);
            let displayValue: ReactNode = chip.capitalize ? (
              <span className="ml-1 capitalize">{chipText}</span>
            ) : (
              chipText
            );

            if (chip.resolveEntityName) {
              const entityList = entityLists[chip.resolveEntityName.listKey];
              const resolvedName = entityList?.find(
                (entity) => entity.id === filterValue
              )?.name;
              displayValue =
                resolvedName ?? chip.resolveEntityName.unknownLabel;
            }

            return (
              <Badge
                key={chip.key}
                variant="outline"
                className="bg-white/60 text-slate-700 border-white/40"
              >
                {chip.label}: {displayValue}
                <button
                  className="ml-2 hover:text-slate-900"
                  onClick={() => removeFilter(chip.key)}
                >
                  <XIcon size={12} />
                </button>
              </Badge>
            );
          })}
        </div>
      )}

      <div className="flex flex-1 flex-col">
        {isPending ? (
          <section className="container mx-auto mb-8 flex justify-center py-8">
            <Card className="bg-white backdrop-blur-xl border border-white shadow-2xl max-w-md w-full h-fit">
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <div className="w-fit mx-auto mb-4 rounded-xl overflow-hidden bg-white backdrop-blur-sm border border-white flex items-center justify-center">
                    <Image
                      src="/loading.webp"
                      width={400}
                      height={400}
                      className="w-64"
                      alt={config.list.loadingImageAlt}
                      priority
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <h2 className="text-xl font-bold text-slate-800">
                    {config.list.loadingTitle}
                    <span className="inline-block w-8 text-left">
                      {loadingDots}
                    </span>
                  </h2>
                  <p className="text-slate-600 text-sm">
                    Pulling the data from another dimension...
                  </p>
                  <p className="text-xs text-slate-500 mt-2">Just a moment</p>
                </div>

                <div className="mt-8 flex justify-center space-x-2">
                  <div
                    className="w-2 h-2 bg-rose-200 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <div
                    className="w-2 h-2 bg-rose-300 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <div
                    className="w-2 h-2 bg-rose-400 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </CardContent>
            </Card>
          </section>
        ) : itemList.length === 0 ? (
          <section className="container mx-auto mb-8 flex justify-center py-8">
            <Card className="bg-white backdrop-blur-xl border border-white shadow-2xl max-w-md w-full h-fit">
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <div className="w-fit mx-auto mb-4 rounded-xl overflow-hidden bg-white backdrop-blur-sm border border-white flex items-center justify-center">
                    <Image
                      src="/no-result.webp"
                      width={400}
                      height={400}
                      className="w-64"
                      alt="No result"
                      priority
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-800">
                    {config.list.emptyTitle} {query && `for "${query}"`}
                  </h2>
                  <p className="text-slate-700 text-lg font-medium">
                    {config.list.emptyDescription}
                  </p>
                  <p className="text-xs text-slate-500 mt-2">
                    Perhaps try a different keyword or check for typos
                  </p>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row justify-center gap-2">
                  <Button
                    className="bg-rose-400 text-white hover:bg-rose-500"
                    onClick={clearAllFilters}
                  >
                    <FilterXIcon />
                    Clear Filters
                  </Button>
                  <Button
                    variant="outline"
                    className="border-rose-400 text-rose-400 hover:bg-rose-400 hover:text-white"
                    onClick={browseAll}
                  >
                    <CompassIcon />
                    {config.list.browseAllLabel}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        ) : (
          <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4 xl:grid-cols-5">
            {itemList.map((item, index) => {
              if (prefersReducedMotion) {
                return (
                  <Fragment key={item.id}>
                    {config.renderCard(item as TItem)}
                  </Fragment>
                );
              }

              const delay = getCardStaggerDelay(index, columnCount);

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{
                    duration: 0.45,
                    delay,
                    ease: cardEntranceEase
                  }}
                >
                  {config.renderCard(item as TItem)}
                </motion.div>
              );
            })}
          </section>
        )}

        {hasNextPage ? (
          <div ref={loadMoreRef} className="h-8 w-full shrink-0" aria-hidden />
        ) : null}
      </div>
    </div>
  );
}
