"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import AnimeCard from "@/app/anime/AnimeCard";

import { fetchAllAnimeService } from "@/services/anime.service";
import {
  genreService,
  studioService,
  themeService
} from "@/services/entity.service";

import GeneralFooter from "@/components/GeneralFooter";
import GlobalPagination from "@/components/GlobalPagination";
import ListHeader from "@/components/ListHeader";
import AnimeFilterSortAccordion from "@/components/filter-accordions/AnimeFilterSortAccordion";

import { useToast } from "@/hooks/useToast";

import type { AnimeFilterSort, AnimeList } from "@/types/anime.type";
import { MetadataResponse } from "@/types/api.type";
import { GenreEntity, StudioEntity, ThemeEntity } from "@/types/entity.type";

import { MEDIA_TYPE, SORT_ORDER } from "@/lib/enums";

import { Loader2Icon } from "lucide-react";
import Image from "next/image";
import { useDebounce } from "use-debounce";

const PAGINATION_SIZE = 15;

type Props = {
  initialAnimeList: AnimeList[];
  initialAnimeMetadata: MetadataResponse;
  initialGenreList: GenreEntity[];
  initialStudioList: StudioEntity[];
  initialThemeList: ThemeEntity[];
};

export default function AnimeListClient({
  initialAnimeList,
  initialAnimeMetadata,
  initialGenreList,
  initialStudioList,
  initialThemeList
}: Props) {
  const toast = useToast();
  const toastRef = useRef(toast.toast);

  const [animeList, setAnimeList] = useState<AnimeList[]>(initialAnimeList);
  const [animeMetadata, setAnimeMetadata] =
    useState<MetadataResponse>(initialAnimeMetadata);
  const [genreList, setGenreList] = useState<GenreEntity[]>(initialGenreList);
  const [studioList, setStudioList] =
    useState<StudioEntity[]>(initialStudioList);
  const [themeList, setThemeList] = useState<ThemeEntity[]>(initialThemeList);

  const [animeFilterSort, setAnimeFilterSort] = useState<AnimeFilterSort>({
    sortBy: "title",
    sortOrder: SORT_ORDER.ASCENDING
  });

  const [isLoadingAnime, setIsLoadingAnime] = useState(false);
  const [isLoadingGenre, setIsLoadingGenre] = useState(false);
  const [isLoadingStudio, setIsLoadingStudio] = useState(false);
  const [isLoadingTheme, setIsLoadingTheme] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchAnime, setSearchAnime] = useState("");
  const [debouncedSearch] = useDebounce(searchAnime, 1000);

  const fetchAnimeList = useCallback(async () => {
    setIsLoadingAnime(true);
    const response = await fetchAllAnimeService(
      currentPage,
      PAGINATION_SIZE,
      debouncedSearch,
      animeFilterSort.sortBy,
      animeFilterSort.sortOrder,
      animeFilterSort.filterGenre,
      animeFilterSort.filterStudio,
      animeFilterSort.filterTheme,
      animeFilterSort.filterProgressStatus,
      animeFilterSort.filterMALScore,
      animeFilterSort.filterPersonalScore,
      animeFilterSort.filterType
    );
    if (response.success) {
      setAnimeList(response.data.data);
      setAnimeMetadata(response.data.metadata);
    } else {
      toastRef.current({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: response.error
      });
    }
    setIsLoadingAnime(false);
  }, [currentPage, debouncedSearch, animeFilterSort]);

  const fetchGenreList = useCallback(async () => {
    setIsLoadingGenre(true);
    const response = await genreService.fetchAll<GenreEntity[]>();
    if (response.success) {
      setGenreList(response.data);
    } else {
      toastRef.current({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: response.error
      });
    }
    setIsLoadingGenre(false);
  }, []);

  const fetchStudioList = useCallback(async () => {
    setIsLoadingStudio(true);
    const response = await studioService.fetchAll<StudioEntity[]>();
    if (response.success) {
      setStudioList(response.data);
    } else {
      toastRef.current({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: response.error
      });
    }
    setIsLoadingStudio(false);
  }, []);

  const fetchThemeList = useCallback(async () => {
    setIsLoadingTheme(true);
    const response = await themeService.fetchAll<ThemeEntity[]>();
    if (response.success) {
      setThemeList(response.data);
    } else {
      toastRef.current({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: response.error
      });
    }
    setIsLoadingTheme(false);
  }, []);

  useEffect(() => {
    fetchAnimeList();
    fetchGenreList();
    fetchStudioList();
    fetchThemeList();
  }, [fetchAnimeList, fetchGenreList, fetchStudioList, fetchThemeList]);

  return (
    <div className="flex flex-col min-h-[100dvh]">
      <ListHeader type={MEDIA_TYPE.ANIME} setSearchMedia={setSearchAnime} />
      <main className="container py-4 xl:py-12 px-4 md:px-6 flex flex-col flex-1">
        <AnimeFilterSortAccordion
          animeFilterSort={animeFilterSort}
          setAnimeFilterSort={setAnimeFilterSort}
          genreList={genreList}
          isLoadingGenre={isLoadingGenre}
          studioList={studioList}
          isLoadingStudio={isLoadingStudio}
          themeList={themeList}
          isLoadingTheme={isLoadingTheme}
        />
        {isLoadingAnime ? (
          <section className="flex flex-col items-center justify-center flex-1">
            <div className="flex items-center justify-center gap-2 xl:gap-4">
              <Loader2Icon className="w-8 h-8 xl:w-16 xl:h-16 animate-spin" />
              <h2>Fetching animes...</h2>
            </div>
          </section>
        ) : animeList.length === 0 ? (
          <section className="flex flex-col items-center justify-center flex-1">
            <div className="flex flex-col items-center justify-center gap-2">
              <Image
                src="/no-result.gif"
                width={128}
                height={128}
                className="w-32 h-32 rounded-xl"
                alt="No result"
              />
              <h2>No results.</h2>
            </div>
          </section>
        ) : (
          <section className="flex flex-col items-center justify-center gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {animeList.map((anime) => {
                return <AnimeCard key={anime.id} anime={anime} />;
              })}
            </div>
            {animeMetadata && (
              <GlobalPagination
                metadata={animeMetadata}
                page={currentPage}
                setPage={setCurrentPage}
              />
            )}
          </section>
        )}
      </main>
      <GeneralFooter />
    </div>
  );
}
