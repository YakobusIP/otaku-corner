import { useCallback, useEffect, useRef, useState } from "react";
import { MEDIA_TYPE, SORT_ORDER } from "@/lib/enums";
import LightNovelCard from "@/components/general/LightNovelCard";
import LightNovelFilterSortAccordion from "@/components/global/LightNovelFilterSortAccordion";
import { useToast } from "@/components/ui/use-toast";
import { fetchAllLightNovelService } from "@/services/lightnovel.service";
import { useDebounce } from "use-debounce";
import type {
  LightNovelFilterSort,
  LightNovelList
} from "@/types/lightnovel.type";
import { Loader2 } from "lucide-react";
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

export default function LightNovelList() {
  const [lightNovelList, setLightNovelList] = useState<LightNovelList[]>([]);
  const [lightNovelMetadata, setLightNovelMetadata] =
    useState<MetadataResponse>();
  const [authorList, setAuthorList] = useState<AuthorEntity[]>([]);
  const [genreList, setGenreList] = useState<GenreEntity[]>([]);
  const [themeList, setThemeList] = useState<ThemeEntity[]>([]);

  const [lightNovelFilterSort, setLightNovelFilterSort] =
    useState<LightNovelFilterSort>({
      sortBy: "title",
      sortOrder: SORT_ORDER.ASCENDING
    });

  const [isLoadingLightNovel, setIsLoadingLightNovel] = useState(false);
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
  const [searchLightNovel, setSearchLightNovel] = useState("");
  const [debouncedSearch] = useDebounce(searchLightNovel, 1000);

  const toast = useToast();

  const toastRef = useRef(toast.toast);

  const fetchLightNovelList = useCallback(async () => {
    setIsLoadingLightNovel(true);
    const response = await fetchAllLightNovelService(
      currentPage,
      limitPerPage,
      debouncedSearch,
      lightNovelFilterSort.sortBy,
      lightNovelFilterSort.sortOrder,
      lightNovelFilterSort.filterAuthor,
      lightNovelFilterSort.filterGenre,
      lightNovelFilterSort.filterTheme,
      lightNovelFilterSort.filterMALScore,
      lightNovelFilterSort.filterPersonalScore
    );
    if (response.success) {
      setLightNovelList(response.data.data);
      setLightNovelMetadata(response.data.metadata);
    } else {
      toastRef.current({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: response.error
      });
    }
    setIsLoadingLightNovel(false);
  }, [currentPage, limitPerPage, debouncedSearch, lightNovelFilterSort]);

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
    fetchLightNovelList();
    fetchAuthorList();
    fetchGenreList();
    fetchThemeList();
  }, [fetchLightNovelList, fetchAuthorList, fetchGenreList, fetchThemeList]);

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
      <ListHeader
        type={MEDIA_TYPE.LIGHT_NOVEL}
        setSearchMedia={setSearchLightNovel}
      />
      <main className="container py-4 xl:py-12 px-4 md:px-6 flex flex-col flex-1">
        <LightNovelFilterSortAccordion
          lightNovelFilterSort={lightNovelFilterSort}
          setLightNovelFilterSort={setLightNovelFilterSort}
          authorList={authorList}
          isLoadingAuthor={isLoadingAuthor}
          genreList={genreList}
          isLoadingGenre={isLoadingGenre}
          themeList={themeList}
          isLoadingTheme={isLoadingTheme}
        />
        {isLoadingLightNovel ? (
          <section className="flex flex-col items-center justify-center flex-1">
            <div className="flex items-center justify-center gap-2 xl:gap-4">
              <Loader2 className="w-8 h-8 xl:w-16 xl:h-16 animate-spin" />
              <h2>Fetching light novels...</h2>
            </div>
          </section>
        ) : lightNovelList.length === 0 ? (
          <section className="flex flex-col items-center justify-center flex-1">
            <div className="flex flex-col items-center justify-center gap-2">
              <img src="/loading.gif" className="w-32 h-32 rounded-xl" />
              <h2>No results.</h2>
            </div>
          </section>
        ) : (
          <section className="flex flex-col items-center justify-center gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {lightNovelList.map((lightNovel) => {
                return (
                  <LightNovelCard key={lightNovel.id} lightNovel={lightNovel} />
                );
              })}
            </div>
            {lightNovelMetadata && (
              <GlobalPagination
                metadata={lightNovelMetadata}
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
