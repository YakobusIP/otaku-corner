"use client";

import { useContext, useEffect, useState } from "react";

import { animeService } from "@/services/anime.service";
import {
  genreService,
  studioService,
  themeService
} from "@/services/entity.service";

import AnimeCard from "@/components/anime/AnimeCard";
import AnimePagination from "@/components/anime/AnimePagination";
import { AnimeContext } from "@/components/context/AnimeContext";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

import { useToast } from "@/hooks/useToast";

import { GenreEntity, StudioEntity, ThemeEntity } from "@/types/entity.type";

import { PROGRESS_STATUS, SORT_ORDER } from "@/lib/enums";

import { useQuery } from "@tanstack/react-query";
import { XIcon } from "lucide-react";
import Image from "next/image";

const PAGINATION_SIZE = 10;

export default function AnimeListSection() {
  const context = useContext(AnimeContext);
  if (!context) {
    throw new Error("AnimeList must be used within an AnimeProvider");
  }

  const { state, setState, setQuery } = context;
  const { page, query, status, filters, sort, order } = state;

  const toast = useToast();

  const { isLoading, data, error } = useQuery({
    queryKey: [
      "animes",
      page,
      PAGINATION_SIZE,
      query,
      sort,
      order,
      filters.genre,
      filters.studio,
      filters.theme,
      status,
      filters.malScore,
      filters.personalScore,
      filters.type
    ],
    queryFn: () =>
      animeService.fetchAll(
        page,
        PAGINATION_SIZE,
        query,
        sort,
        order as SORT_ORDER,
        filters.genre,
        filters.studio,
        filters.theme,
        status as keyof typeof PROGRESS_STATUS,
        filters.malScore,
        filters.personalScore,
        filters.type
      )
  });

  const animeList = data?.data;
  const animeMetadata = data?.metadata;

  if (error) {
    toast.toast({
      variant: "destructive",
      title: "Uh oh! Something went wrong",
      description: error.message
    });
  }

  const { data: genreList, error: genreError } = useQuery({
    queryKey: ["genres"],
    queryFn: () => genreService.fetchAll<GenreEntity[]>(),
    refetchOnWindowFocus: false,
    staleTime: 24 * 60 * 60 * 1000
  });

  if (genreError) {
    toast.toast({
      variant: "destructive",
      title: "Uh oh! Something went wrong",
      description: genreError.message
    });
  }

  const { data: studioList, error: studioError } = useQuery({
    queryKey: ["studios"],
    queryFn: () => studioService.fetchAll<StudioEntity[]>(),
    refetchOnWindowFocus: false,
    staleTime: 24 * 60 * 60 * 1000
  });

  if (studioError) {
    toast.toast({
      variant: "destructive",
      title: "Uh oh! Something went wrong",
      description: studioError.message
    });
  }

  const { data: themeList, error: themeError } = useQuery({
    queryKey: ["themes"],
    queryFn: () => themeService.fetchAll<ThemeEntity[]>(),
    refetchOnWindowFocus: false,
    staleTime: 24 * 60 * 60 * 1000
  });

  if (themeError) {
    toast.toast({
      variant: "destructive",
      title: "Uh oh! Something went wrong",
      description: themeError.message
    });
  }

  const removeFilter = <K extends keyof typeof filters>(field: K) => {
    setState({
      page: 1,
      filters: {
        ...filters,
        [field]: undefined
      }
    });
  };

  const activeFiltersCount = [
    filters.genre,
    filters.studio,
    filters.theme,
    filters.malScore,
    filters.personalScore,
    filters.type
  ].filter((f) => f !== undefined).length;

  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev === "...") return "";
        return prev + ".";
      });
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col flex-1">
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
              {genreList?.find((genre) => genre.id === filters.genre)!.name}
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
              {studioList?.find((studio) => studio.id === filters.studio)!.name}
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
              {themeList?.find((theme) => theme.id === filters.theme)!.name}
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
                onClick={() => {
                  removeFilter("malScore");
                  console.log("hai");
                }}
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

      <div className="flex flex-1">
        {isLoading ? (
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
                      alt="Loading animes"
                      unoptimized
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <h2 className="text-xl font-bold text-slate-800">
                    Fetching animes
                    <span className="inline-block w-8 text-left">{dots}</span>
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
        ) : animeList?.length === 0 ? (
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
          <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
            {animeList?.map((anime) => {
              return <AnimeCard key={anime.id} anime={anime} />;
            })}
          </section>
        )}
      </div>

      {animeMetadata ? <AnimePagination animeMetadata={animeMetadata} /> : null}
    </div>
  );
}
