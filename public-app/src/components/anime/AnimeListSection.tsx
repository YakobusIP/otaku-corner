"use client";

import { useCallback, useRef } from "react";

import AnimeCard from "@/components/anime/AnimeCard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

import { useAnimeGridColumnCount } from "@/hooks/useAnimeGridColumnCount";
import { useAnimeListBody } from "@/hooks/useAnimeListBody";

import { getAnimeCardStaggerDelay } from "@/lib/anime-grid-stagger";

import { motion, useReducedMotion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { XIcon } from "lucide-react";
import Image from "next/image";

const cardEntranceEase = [0.22, 1, 0.36, 1] as const;

export default function AnimeListSection() {
  const prefersReducedMotion = useReducedMotion();
  const columnCount = useAnimeGridColumnCount();

  const {
    query,
    filters,
    setQuery,
    animeList,
    animeMetadata,
    isPending,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    genreList,
    studioList,
    themeList,
    removeFilter,
    activeFiltersCount,
    loadingDots
  } = useAnimeListBody();

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
            Showing {animeMetadata?.itemCount} results
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

          {filters.studio !== undefined && (
            <Badge
              variant="outline"
              className="bg-white/60 text-slate-700 border-white/40"
            >
              Studio:{" "}
              {studioList?.find((studio) => studio.id === filters.studio)
                ?.name ?? "Unknown studio"}
              <button
                className="ml-2 hover:text-slate-900"
                onClick={() => removeFilter("studio")}
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

          {filters.type !== undefined && (
            <Badge
              variant="outline"
              className="bg-white/60 text-slate-700 border-white/40"
            >
              Type: {filters.type}
              <button
                className="ml-2 hover:text-slate-900"
                onClick={() => removeFilter("type")}
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
            <Card className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl max-w-md w-full h-fit">
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <div className="w-fit mx-auto mb-4 rounded-xl overflow-hidden bg-white/60 backdrop-blur-sm border border-white/40 flex items-center justify-center">
                    <Image
                      src="/loading.gif"
                      width={220}
                      height={124}
                      className="object-cover"
                      alt="Loading animes"
                      unoptimized
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <h2 className="text-xl font-bold text-slate-800">
                    Fetching animes
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
                    className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <div
                    className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <div
                    className="w-2 h-2 bg-orange-600 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </CardContent>
            </Card>
          </section>
        ) : animeList.length === 0 ? (
          <section className="container mx-auto mb-8 flex justify-center py-8">
            <Card className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl max-w-md w-full h-fit">
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <div className="w-fit mx-auto mb-4 rounded-xl overflow-hidden bg-white/60 backdrop-blur-sm border border-white/40 flex items-center justify-center">
                    <Image
                      src="/no-result.gif"
                      width={128}
                      height={128}
                      className="w-32 h-32 rounded-xl"
                      alt="No result"
                      unoptimized
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-800">
                    No Anime Found {query && `for "${query}"`}
                  </h2>
                  <p className="text-slate-700 text-lg font-medium">
                    We couldn&apos;t find any anime matching your search
                  </p>
                  <p className="text-xs text-slate-500 mt-2">
                    Perhaps try a different keyword or check for typos
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>
        ) : (
          <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4 xl:grid-cols-5">
            {animeList.map((anime, index) => {
              if (prefersReducedMotion) {
                return <AnimeCard key={anime.id} anime={anime} />;
              }

              const delay = getAnimeCardStaggerDelay(index, columnCount);

              return (
                <motion.div
                  key={anime.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{
                    duration: 0.45,
                    delay,
                    ease: cardEntranceEase
                  }}
                >
                  <AnimeCard anime={anime} />
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
