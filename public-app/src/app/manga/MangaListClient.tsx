"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import MangaCard from "@/app/manga/MangaCard";

import {
  authorService,
  genreService,
  themeService
} from "@/services/entity.service";
import { fetchAllMangaService } from "@/services/manga.service";

import GeneralFooter from "@/components/GeneralFooter";
import GlobalPagination from "@/components/GlobalPagination";
import ListHeader from "@/components/ListHeader";
import MangaFilterSortAccordion from "@/components/filter-accordions/MangaFilterSortAccordion";

import { useToast } from "@/hooks/useToast";

import { MetadataResponse } from "@/types/api.type";
import { AuthorEntity, GenreEntity, ThemeEntity } from "@/types/entity.type";
import type { MangaFilterSort, MangaList } from "@/types/manga.type";

import { MEDIA_TYPE, SORT_ORDER } from "@/lib/enums";

import { Loader2Icon } from "lucide-react";
import Image from "next/image";
import { useDebounce } from "use-debounce";

const PAGINATION_SIZE = 15;

type Props = {
  initialMangaList: MangaList[];
  initialMangaMetadata: MetadataResponse;
  initialAuthorList: AuthorEntity[];
  initialGenreList: GenreEntity[];
  initialThemeList: ThemeEntity[];
};

export default function MangaListClient({
  initialMangaList,
  initialMangaMetadata,
  initialAuthorList,
  initialGenreList,
  initialThemeList
}: Props) {
  const toast = useToast();
  const toastRef = useRef(toast.toast);

  const [mangaList, setMangaList] = useState<MangaList[]>(initialMangaList);
  const [mangaMetadata, setMangaMetadata] =
    useState<MetadataResponse>(initialMangaMetadata);
  const [authorList, setAuthorList] =
    useState<AuthorEntity[]>(initialAuthorList);
  const [genreList, setGenreList] = useState<GenreEntity[]>(initialGenreList);
  const [themeList, setThemeList] = useState<ThemeEntity[]>(initialThemeList);

  const [mangaFilterSort, setMangaFilterSort] = useState<MangaFilterSort>({
    sortBy: "title",
    sortOrder: SORT_ORDER.ASCENDING
  });

  const [isLoadingManga, setIsLoadingManga] = useState(false);
  const [isLoadingAuthor, setIsLoadingAuthor] = useState(false);
  const [isLoadingGenre, setIsLoadingGenre] = useState(false);
  const [isLoadingTheme, setIsLoadingTheme] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchManga, setSearchManga] = useState("");
  const [debouncedSearch] = useDebounce(searchManga, 1000);

  const fetchMangaList = useCallback(async () => {
    setIsLoadingManga(true);
    const response = await fetchAllMangaService(
      currentPage,
      PAGINATION_SIZE,
      debouncedSearch,
      mangaFilterSort.sortBy,
      mangaFilterSort.sortOrder,
      mangaFilterSort.filterAuthor,
      mangaFilterSort.filterGenre,
      mangaFilterSort.filterTheme,
      mangaFilterSort.filterProgressStatus,
      mangaFilterSort.filterMALScore,
      mangaFilterSort.filterPersonalScore
    );
    if (response.success) {
      setMangaList(response.data.data);
      setMangaMetadata(response.data.metadata);
    } else {
      toastRef.current({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: response.error
      });
    }
    setIsLoadingManga(false);
  }, [currentPage, debouncedSearch, mangaFilterSort]);

  const fetchAuthorList = useCallback(async () => {
    setIsLoadingAuthor(true);
    const response = await authorService.fetchAll<AuthorEntity[]>();
    if (response.success) {
      setAuthorList(response.data);
    } else {
      toastRef.current({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: response.error
      });
    }
    setIsLoadingAuthor(false);
  }, []);

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
    fetchMangaList();
    fetchAuthorList();
    fetchGenreList();
    fetchThemeList();
  }, [fetchMangaList, fetchAuthorList, fetchGenreList, fetchThemeList]);

  return (
    <div className="flex flex-col min-h-[100dvh]">
      <ListHeader type={MEDIA_TYPE.MANGA} setSearchMedia={setSearchManga} />
      <main className="container py-4 xl:py-12 px-4 md:px-6 flex flex-col flex-1">
        <MangaFilterSortAccordion
          mangaFilterSort={mangaFilterSort}
          setMangaFilterSort={setMangaFilterSort}
          authorList={authorList}
          isLoadingAuthor={isLoadingAuthor}
          genreList={genreList}
          isLoadingGenre={isLoadingGenre}
          themeList={themeList}
          isLoadingTheme={isLoadingTheme}
        />
        {isLoadingManga ? (
          <section className="flex flex-col items-center justify-center flex-1">
            <div className="flex items-center justify-center gap-2 xl:gap-4">
              <Loader2Icon className="w-8 h-8 xl:w-16 xl:h-16 animate-spin" />
              <h2>Fetching mangas...</h2>
            </div>
          </section>
        ) : mangaList.length === 0 ? (
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
              {mangaList.map((manga) => {
                return <MangaCard key={manga.id} manga={manga} />;
              })}
            </div>
            {mangaMetadata && (
              <GlobalPagination
                metadata={mangaMetadata}
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
