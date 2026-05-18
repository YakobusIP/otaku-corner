"use client";

import { useContext, useEffect, useMemo } from "react";

import {
  genreService,
  studioService,
  themeService
} from "@/services/entity.service";

import { AnimeContext } from "@/components/context/AnimeContext";

import { useLoadingDots } from "@/hooks/useLoadingDots";
import { useQueryErrorToast } from "@/hooks/useQueryErrorToast";

import { GenreEntity, StudioEntity, ThemeEntity } from "@/types/entity.type";

import { type ProgressStatusKey, SORT_ORDER } from "@/lib/enums";
import {
  ANIME_LIST_PAGE_LIMIT,
  getAnimeListInfiniteQueryOptions
} from "@/lib/public-list-infinite-queries";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";

export const useAnimeListBody = () => {
  const context = useContext(AnimeContext);
  if (!context) {
    throw new Error("useAnimeListBody must be used within an AnimeProvider");
  }

  const { state, setState, setQuery } = context;
  const { query, status, filters, sort, order } = state;

  const listFilters = useMemo(
    () => ({
      limit: ANIME_LIST_PAGE_LIMIT,
      query: query ?? "",
      sort: sort ?? "title",
      order: order ?? SORT_ORDER.ASCENDING,
      genre: filters.genre,
      studio: filters.studio,
      theme: filters.theme,
      status: (status ?? "") as ProgressStatusKey | "",
      malScore: filters.malScore,
      personalScore: filters.personalScore,
      type: filters.type
    }),
    [
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
    ]
  );

  const {
    data,
    error,
    isPending,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery(getAnimeListInfiniteQueryOptions(listFilters));

  const animeList = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data]
  );
  const animeMetadata = data?.pages[0]?.metadata;

  const { ref: sentinelRef, inView } = useInView({ rootMargin: "240px" });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  useQueryErrorToast(error);

  const { data: genreList, error: genreError } = useQuery({
    queryKey: ["genres"],
    queryFn: () => genreService.fetchAll<GenreEntity>(),
    refetchOnWindowFocus: false,
    staleTime: 24 * 60 * 60 * 1000
  });

  useQueryErrorToast(genreError);

  const { data: studioList, error: studioError } = useQuery({
    queryKey: ["studios"],
    queryFn: () => studioService.fetchAll<StudioEntity>(),
    refetchOnWindowFocus: false,
    staleTime: 24 * 60 * 60 * 1000
  });

  useQueryErrorToast(studioError);

  const { data: themeList, error: themeError } = useQuery({
    queryKey: ["themes"],
    queryFn: () => themeService.fetchAll<ThemeEntity>(),
    refetchOnWindowFocus: false,
    staleTime: 24 * 60 * 60 * 1000
  });

  useQueryErrorToast(themeError);

  const removeFilter = <K extends keyof typeof filters>(field: K) => {
    setState({
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

  const loadingDots = useLoadingDots();

  return {
    query,
    status,
    filters,
    setQuery,
    animeList,
    animeMetadata,
    isPending,
    hasNextPage,
    isFetchingNextPage,
    sentinelRef,
    genreList,
    studioList,
    themeList,
    removeFilter,
    activeFiltersCount,
    loadingDots
  };
};
