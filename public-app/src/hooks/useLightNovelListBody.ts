"use client";

import { useContext, useMemo } from "react";

import {
  authorService,
  genreService,
  themeService
} from "@/services/entity.service";

import { LightNovelContext } from "@/components/context/LightNovelContext";

import { useLoadingDots } from "@/hooks/useLoadingDots";
import { useQueryErrorToast } from "@/hooks/useQueryErrorToast";

import { AuthorEntity, GenreEntity, ThemeEntity } from "@/types/entity.type";

import { type ProgressStatusKey, SORT_ORDER } from "@/lib/enums";
import {
  LIGHT_NOVEL_LIST_PAGE_LIMIT,
  getLightNovelListInfiniteQueryOptions
} from "@/lib/public-list-infinite-queries";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

export const useLightNovelListBody = () => {
  const context = useContext(LightNovelContext);
  if (!context) {
    throw new Error(
      "useLightNovelListBody must be used within a LightNovelProvider"
    );
  }

  const { state, setState, setQuery } = context;
  const { query, status, filters, sort, order } = state;

  const listFilters = useMemo(
    () => ({
      limit: LIGHT_NOVEL_LIST_PAGE_LIMIT,
      query: query ?? "",
      sort: sort ?? "title",
      order: order ?? SORT_ORDER.ASCENDING,
      author: filters.author,
      genre: filters.genre,
      theme: filters.theme,
      status: (status ?? "") as ProgressStatusKey | "",
      malScore: filters.malScore,
      personalScore: filters.personalScore
    }),
    [
      query,
      sort,
      order,
      filters.author,
      filters.genre,
      filters.theme,
      status,
      filters.malScore,
      filters.personalScore
    ]
  );

  const listQuery = useInfiniteQuery(
    getLightNovelListInfiniteQueryOptions(listFilters)
  );

  const {
    data,
    error,
    isPending,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = listQuery;

  const lightNovelList = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data]
  );
  const lightNovelMetadata = data?.pages[0]?.metadata;

  useQueryErrorToast(error);

  const { data: genreList, error: genreError } = useQuery({
    queryKey: ["genres"],
    queryFn: () => genreService.fetchAll<GenreEntity>(),
    refetchOnWindowFocus: false,
    staleTime: 24 * 60 * 60 * 1000
  });

  useQueryErrorToast(genreError);

  const { data: authorList, error: authorError } = useQuery({
    queryKey: ["authors"],
    queryFn: () => authorService.fetchAll<AuthorEntity>(),
    refetchOnWindowFocus: false,
    staleTime: 24 * 60 * 60 * 1000
  });

  useQueryErrorToast(authorError);

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

  const clearAllFilters = () => {
    setQuery("");
    setState({
      filters: {
        author: undefined,
        genre: undefined,
        theme: undefined,
        malScore: undefined,
        personalScore: undefined
      }
    });
  };

  const browseAllLightNovels = () => {
    setState({ status: undefined });
  };

  const activeFiltersCount = [
    filters.author,
    filters.genre,
    filters.theme,
    filters.malScore,
    filters.personalScore
  ].filter((f) => f !== undefined).length;

  const loadingDots = useLoadingDots();

  return {
    query,
    filters,
    setQuery,
    lightNovelList,
    lightNovelMetadata,
    isPending,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    genreList,
    authorList,
    themeList,
    removeFilter,
    clearAllFilters,
    browseAllLightNovels,
    activeFiltersCount,
    loadingDots
  };
};
