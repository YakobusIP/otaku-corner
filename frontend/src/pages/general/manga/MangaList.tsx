import { useCallback, useEffect, useRef, useState } from "react";
import { MEDIA_TYPE, SORT_ORDER } from "@/lib/enums";
import MangaCard from "@/components/general/MangaCard";
import MangaFilterSortAccordion from "@/components/global/MangaFilterSortAccordion";
import { useToast } from "@/components/ui/use-toast";
import { fetchAllMangaService } from "@/services/manga.service";
import { useDebounce } from "use-debounce";
import type { MangaFilterSort, MangaList } from "@/types/manga.type";
import { Loader2Icon } from "lucide-react";
import {
  genreService,
  authorService,
  themeService
} from "@/services/entity.service";
import { GenreEntity, AuthorEntity, ThemeEntity } from "@/types/entity.type";
import { MetadataResponse } from "@/types/api.type";
import GlobalPagination from "@/components/global/GlobalPagination";
import ListHeader from "@/components/general/ListHeader";
import GeneralFooter from "@/components/general/GeneralFooter";

export default function MangaList() {
  const [mangaList, setMangaList] = useState<MangaList[]>([]);
  const [mangaMetadata, setMangaMetadata] = useState<MetadataResponse>();
  const [authorList, setAuthorList] = useState<AuthorEntity[]>([]);
  const [genreList, setGenreList] = useState<GenreEntity[]>([]);
  const [themeList, setThemeList] = useState<ThemeEntity[]>([]);

  const [mangaFilterSort, setMangaFilterSort] = useState<MangaFilterSort>({
    sortBy: "title",
    sortOrder: SORT_ORDER.ASCENDING
  });

  const [isLoadingManga, setIsLoadingManga] = useState(false);
  const [isLoadingAuthor, setIsLoadingAuthor] = useState(false);
  const [isLoadingGenre, setIsLoadingGenre] = useState(false);
  const [isLoadingTheme, setIsLoadingTheme] = useState(false);

  const calculateLimitPerPage = () => {
    if (window.innerWidth < 640) return 10;
    else if (window.innerWidth >= 640 && window.innerWidth < 768) return 10;
    else if (window.innerWidth >= 768 && window.innerWidth < 1024) return 9;
    else if (window.innerWidth >= 1024 && window.innerWidth < 1280) return 8;
    else return 10;
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [limitPerPage, setLimitPerPage] = useState(calculateLimitPerPage());
  const [searchManga, setSearchManga] = useState("");
  const [debouncedSearch] = useDebounce(searchManga, 1000);

  const toast = useToast();

  const toastRef = useRef(toast.toast);

  const fetchMangaList = useCallback(async () => {
    setIsLoadingManga(true);
    const response = await fetchAllMangaService(
      currentPage,
      limitPerPage,
      debouncedSearch,
      mangaFilterSort.sortBy,
      mangaFilterSort.sortOrder,
      mangaFilterSort.filterAuthor,
      mangaFilterSort.filterGenre,
      mangaFilterSort.filterTheme,
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
  }, [currentPage, limitPerPage, debouncedSearch, mangaFilterSort]);

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

  useEffect(() => {
    const handleResize = () => {
      setLimitPerPage(calculateLimitPerPage());
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

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
              <img src="/loading.gif" className="w-32 h-32 rounded-xl" />
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
