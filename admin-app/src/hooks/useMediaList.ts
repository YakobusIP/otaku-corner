import { useMemo, useState } from "react";

import { animeService } from "@/services/anime.service";

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
        sort: animeFilters.sortBy,
        order: animeFilters.sortOrder,
        genre: animeFilters.filterGenre,
        studio: animeFilters.filterStudio,
        theme: animeFilters.filterTheme,
        status: animeFilters.filterProgressStatus,
        mal_score: animeFilters.filterMALScore,
        personal_score: animeFilters.filterPersonalScore,
        type: animeFilters.filterType,
        status_check: animeFilters.filterStatusCheck
      })
  });

  const mangaListQuery = useQuery({
    queryKey: mediaListKeys.mangasWithFilters(mangaFilters),
    queryFn: () =>
      mangaService.list({
        page,
        limit,
        query,
        sort: mangaFilters.sortBy,
        order: mangaFilters.sortOrder
      })
  });

  const lightNovelListQuery = useQuery({
    queryKey: mediaListKeys.lightNovelsWithFilters(lightNovelFilters),
    queryFn: () =>
      lightNovelService.list({
        page,
        limit,
        query,
        sort: lightNovelFilters.sortBy,
        order: lightNovelFilters.sortOrder
      })
  });
};
