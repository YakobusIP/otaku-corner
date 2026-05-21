"use client";

import { useCallback, useRef } from "react";

import MangaCard from "@/components/manga/MangaCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { useMangaGridColumnCount } from "@/hooks/useMangaGridColumnCount";
import { useMangaListBody } from "@/hooks/useMangaListBody";

import { getMangaCardStaggerDelay } from "@/lib/manga-grid-stagger";

import { motion, useReducedMotion } from "framer-motion";
import { CompassIcon, SearchIcon, XIcon } from "lucide-react";
import Image from "next/image";
import { useInView } from "react-intersection-observer";

const cardEntranceEase = [0.22, 1, 0.36, 1] as const;

export default function MangaListSection() {
  const prefersReducedMotion = useReducedMotion();
  const columnCount = useMangaGridColumnCount();

  const {
    query,
    filters,
    setQuery,
    mangaList,
    mangaMetadata,
    isPending,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    genreList,
    authorList,
    themeList,
    removeFilter,
    clearAllFilters,
    browseAllManga,
    activeFiltersCount,
    loadingDots
  } = useMangaListBody();

  const fetchNextPageRef = useRef(fetchNextPage);
  fetchNextPageRef.current = fetchNextPage;

  const hasNextPageRef = useRef(hasNextPage);
  hasNextPageRef.current = hasNextPage;

  const isFetchingNextPageRef = useRef(isFetchingNextPage);
  isFetchingNextPageRef.current = isFetchingNextPage;

  const fetchNextIfNeeded = useCallback(() => {
    if (!hasNextPageRef.current || isFetchingNextPageRef.current) return;
    void fetchNextPageRef.current();
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
      {(query || activeFiltersCount > 0) && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="text-slate-700">
            Showing {mangaMetadata?.itemCount} results
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

          {filters.author !== undefined && (
            <Badge
              variant="outline"
              className="bg-white/60 text-slate-700 border-white/40"
            >
              Author:{" "}
              {authorList?.find((author) => author.id === filters.author)
                ?.name ?? "Unknown author"}
              <button
                className="ml-2 hover:text-slate-900"
                onClick={() => removeFilter("author")}
              >
                <XIcon size={12} />
              </button>
            </Badge>
          )}

          {filters.genre !== undefined && (
            <Badge
              variant="outline"
              className="bg-white/60 text-slate-700 border-white/40"
            >
              Genre:{" "}
              {genreList?.find((genre) => genre.id === filters.genre)?.name ??
                "Unknown genre"}
              <button
                className="ml-2 hover:text-slate-900"
                onClick={() => removeFilter("genre")}
              >
                <XIcon size={12} />
              </button>
            </Badge>
          )}

          {filters.theme !== undefined && (
            <Badge
              variant="outline"
              className="bg-white/60 text-slate-700 border-white/40"
            >
              Theme:{" "}
              {themeList?.find((theme) => theme.id === filters.theme)?.name ??
                "Unknown theme"}
              <button
                className="ml-2 hover:text-slate-900"
                onClick={() => removeFilter("theme")}
              >
                <XIcon size={12} />
              </button>
            </Badge>
          )}

          {filters.malScore !== undefined && (
            <Badge
              variant="outline"
              className="bg-white/60 text-slate-700 border-white/40"
            >
              MAL Score:{" "}
              <span className="ml-1 capitalize">{filters.malScore}</span>
              <button
                className="ml-2 hover:text-slate-900"
                onClick={() => removeFilter("malScore")}
              >
                <XIcon size={12} />
              </button>
            </Badge>
          )}

          {filters.personalScore !== undefined && (
            <Badge
              variant="outline"
              className="bg-white/60 text-slate-700 border-white/40"
            >
              Personal Score:
              <span className="ml-1 capitalize">{filters.personalScore}</span>
              <button
                className="ml-2 hover:text-slate-900"
                onClick={() => removeFilter("personalScore")}
              >
                <XIcon size={12} />
              </button>
            </Badge>
          )}
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
                      alt="Loading mangas"
                      unoptimized
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <h2 className="text-xl font-bold text-slate-800">
                    Fetching mangas
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
        ) : mangaList.length === 0 ? (
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
                      unoptimized
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-800">
                    No Manga Found {query && `for "${query}"`}
                  </h2>
                  <p className="text-slate-700 text-lg font-medium">
                    We couldn&apos;t find any manga matching your search
                  </p>
                  <p className="text-xs text-slate-500 mt-2">
                    Perhaps try a different keyword or check for typos
                  </p>
                </div>

                <div className="mt-8 flex justify-center space-x-2">
                  <Button
                    className="bg-rose-400 text-white hover:bg-rose-500"
                    onClick={clearAllFilters}
                  >
                    <SearchIcon />
                    Clear Filters
                  </Button>
                  <Button
                    variant="outline"
                    className="border-rose-400 text-rose-400 hover:bg-rose-400 hover:text-white"
                    onClick={browseAllManga}
                  >
                    <CompassIcon />
                    Browse All Manga
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        ) : (
          <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4 xl:grid-cols-5">
            {mangaList.map((manga, index) => {
              if (prefersReducedMotion) {
                return <MangaCard key={manga.id} manga={manga} />;
              }

              const delay = getMangaCardStaggerDelay(index, columnCount);

              return (
                <motion.div
                  key={manga.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{
                    duration: 0.45,
                    delay,
                    ease: cardEntranceEase
                  }}
                >
                  <MangaCard manga={manga} />
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
