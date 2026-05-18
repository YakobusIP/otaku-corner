"use client";

import MangaCard from "@/components/manga/MangaCard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

import { useMangaListBody } from "@/hooks/useMangaListBody";

import { XIcon } from "lucide-react";
import Image from "next/image";

export default function MangaListSection() {
  const {
    query,
    filters,
    setQuery,
    mangaList,
    mangaMetadata,
    isPending,
    hasNextPage,
    isFetchingNextPage,
    sentinelRef,
    genreList,
    authorList,
    themeList,
    removeFilter,
    activeFiltersCount,
    loadingDots
  } = useMangaListBody();

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col flex-1">
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
              Personal Score:{" "}
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
          <section className="container mx-auto px-4 py-8 mb-8 flex justify-center">
            <Card className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl max-w-md w-full h-fit">
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <div className="w-fit mx-auto mb-4 rounded-xl overflow-hidden bg-white/60 backdrop-blur-sm border border-white/40 flex items-center justify-center">
                    <Image
                      src="/loading.gif"
                      width={220}
                      height={124}
                      className="object-cover"
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
        ) : mangaList.length === 0 ? (
          <section className="container mx-auto px-4 py-8 mb-8 flex justify-center">
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
                    No Manga Found {query && `for "${query}"`}
                  </h2>
                  <p className="text-slate-700 text-lg font-medium">
                    We couldn&apos;t find any manga matching your search
                  </p>
                  <p className="text-xs text-slate-500 mt-2">
                    Perhaps try a different keyword or check for typos
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>
        ) : (
          <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
            {mangaList.map((manga) => {
              return <MangaCard key={manga.id} manga={manga} />;
            })}
          </section>
        )}

        {hasNextPage ? (
          <div
            ref={sentinelRef}
            className="h-8 w-full shrink-0 flex items-center justify-center text-xs text-slate-500"
            aria-hidden
          >
            {isFetchingNextPage ? "Loading more…" : ""}
          </div>
        ) : null}
      </div>
    </div>
  );
}
