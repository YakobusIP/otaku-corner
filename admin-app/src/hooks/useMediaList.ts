import { useMemo, useState } from "react";

import { animeService } from "@/services/anime.service";
import { lightNovelService } from "@/services/lightnovel.service";
import { mangaService } from "@/services/manga.service";

import { AnimeFilterSort } from "@/types/anime.type";
import { LightNovelFilterSort } from "@/types/lightnovel.type";
import { MangaFilterSort } from "@/types/manga.type";

import { PROGRESS_STATUS, SORT_ORDER } from "@/lib/enums";

import { useQuery } from "@tanstack/react-query";

type MediaOptions = "all" | "anime" | "manga" | "light-novel";

const mediaListKeys = {
  animes: ["animes"] as const,
  animesWithFilters: (filters: AnimeFilterSort) =>
    [...mediaListKeys.animes, filters] as const,
  mangas: ["mangas"] as const,
  mangasWithFilters: (filters: MangaFilterSort) =>
    [...mediaListKeys.mangas, filters] as const,
  lightNovels: ["light-novels"] as const,
  lightNovelsWithFilters: (filters: LightNovelFilterSort) =>
    [...mediaListKeys.lightNovels, filters] as const
};

export const useMediaList = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [query, setQuery] = useState("");

  const [animeFilters, setAnimeFilters] = useState<AnimeFilterSort>(
    {} as AnimeFilterSort
  );
  const [mangaFilters, setMangaFilters] = useState<MangaFilterSort>(
    {} as MangaFilterSort
  );
  const [lightNovelFilters, setLightNovelFilters] =
    useState<LightNovelFilterSort>({} as LightNovelFilterSort);

  const [currentMedia, setCurrentMedia] = useState<MediaOptions>("all");

  const animeListQuery = useQuery({
    queryKey: mediaListKeys.animesWithFilters(animeFilters),
    queryFn: () =>
      animeService.list({
        page,
        limit,
        query,
        sortBy: animeFilters.sortBy ?? "title",
        sortOrder: animeFilters.sortOrder ?? SORT_ORDER.ASCENDING,
        filterGenre: animeFilters.filterGenre,
        filterStudio: animeFilters.filterStudio,
        filterTheme: animeFilters.filterTheme,
        filterProgressStatus: animeFilters.filterProgressStatus,
        filterMALScore: animeFilters.filterMALScore,
        filterPersonalScore: animeFilters.filterPersonalScore,
        filterType: animeFilters.filterType,
        filterStatusCheck: animeFilters.filterStatusCheck
      })
  });

  const mangaListQuery = useQuery({
    queryKey: mediaListKeys.mangasWithFilters(mangaFilters),
    queryFn: () =>
      mangaService.fetchAll(
        page,
        limit,
        query,
        mangaFilters.sortBy,
        mangaFilters.sortOrder
      )
  });

  const lightNovelListQuery = useQuery({
    queryKey: mediaListKeys.lightNovelsWithFilters(lightNovelFilters),
    queryFn: () =>
      lightNovelService.fetchAll(
        page,
        limit,
        query,
        lightNovelFilters.sortBy,
        lightNovelFilters.sortOrder
      )
  });

  const listQuery = useMemo(() => {
    if (currentMedia === "anime") return animeListQuery;
    if (currentMedia === "manga") return mangaListQuery;
    if (currentMedia === "light-novel") return lightNovelListQuery;

    return {
      isLoading:
        animeListQuery.isLoading ||
        mangaListQuery.isLoading ||
        lightNovelListQuery.isLoading,
      data: {
        anime: animeListQuery.data,
        manga: mangaListQuery.data,
        lightNovel: lightNovelListQuery.data
      }
    };
  }, [animeListQuery, currentMedia, lightNovelListQuery, mangaListQuery]);

  return {
    page,
    setPage,
    limit,
    setLimit,
    query,
    setQuery,
    animeFilters,
    setAnimeFilters,
    mangaFilters,
    setMangaFilters,
    lightNovelFilters,
    setLightNovelFilters,
    currentMedia,
    setCurrentMedia,
    animeListQuery,
    mangaListQuery,
    lightNovelListQuery,
    listQuery
  };
};
