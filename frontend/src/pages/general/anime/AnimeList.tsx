import { useCallback, useEffect, useRef, useState } from "react";
import { MediaType, SortOrder } from "@/enum/general.enum";
import AnimeCard from "@/components/general/AnimeCard";
import AnimeFilterSortAccordion from "@/components/global/AnimeFilterSortAccordion";
import { useToast } from "@/components/ui/use-toast";
import { fetchAllAnimeService } from "@/services/anime.service";
import { useDebounce } from "use-debounce";
import type { AnimeFilterSort, AnimeList } from "@/types/anime.type";
import { Loader2 } from "lucide-react";
import {
  genreService,
  studioService,
  themeService
} from "@/services/entity.service";
import { GenreEntity, StudioEntity, ThemeEntity } from "@/types/entity.type";
import { MetadataResponse } from "@/types/api.type";
import GlobalPagination from "@/components/global/GlobalPagination";
import ListHeader from "@/components/general/ListHeader";
import GeneralFooter from "@/components/general/GeneralFooter";

export default function AnimeList() {
  const [animeList, setAnimeList] = useState<AnimeList[]>([]);
  const [animeMetadata, setAnimeMetadata] = useState<MetadataResponse>();
  const [genreList, setGenreList] = useState<GenreEntity[]>([]);
  const [studioList, setStudioList] = useState<StudioEntity[]>([]);
  const [themeList, setThemeList] = useState<ThemeEntity[]>([]);

  const [animeFilterSort, setAnimeFilterSort] = useState<AnimeFilterSort>({
    sortBy: "title",
    sortOrder: SortOrder.ASCENDING
  });

  const [isLoadingAnime, setIsLoadingAnime] = useState(false);
  const [isLoadingGenre, setIsLoadingGenre] = useState(false);
  const [isLoadingStudio, setIsLoadingStudio] = useState(false);
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
  const [searchAnime, setSearchAnime] = useState("");
  const [debouncedSearch] = useDebounce(searchAnime, 1000);

  const toast = useToast();

  const toastRef = useRef(toast.toast);

  const fetchAnimeList = useCallback(async () => {
    setIsLoadingAnime(true);
    const response = await fetchAllAnimeService(
      currentPage,
      limitPerPage,
      debouncedSearch,
      animeFilterSort.sortBy,
      animeFilterSort.sortOrder,
      animeFilterSort.filterGenre,
      animeFilterSort.filterStudio,
      animeFilterSort.filterTheme,
      animeFilterSort.filterMALScore,
      animeFilterSort.filterPersonalScore,
      animeFilterSort.filterType
    );
    if (response.success) {
      setAnimeList(response.data.data);
      setAnimeMetadata(response.data.metadata);
    } else {
      toastRef.current({
        title: "Uh oh! Something went wrong",
        description: response.error
      });
    }
    setIsLoadingAnime(false);
  }, [currentPage, limitPerPage, debouncedSearch, animeFilterSort]);

  const fetchGenreList = useCallback(async () => {
    setIsLoadingGenre(true);
    const response = await genreService.fetchAll<GenreEntity[]>();
    if (response.success) {
      setGenreList(response.data);
    } else {
      toastRef.current({
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
      <ListHeader type={MediaType.ANIME} setSearchMedia={setSearchAnime} />
      <main className="container py-4 lg:py-12 px-4 md:px-6 flex flex-col flex-1">
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
            <div className="flex items-center justify-center gap-2 lg:gap-4">
              <Loader2 className="w-8 h-8 lg:w-16 lg:h-16 animate-spin" />
              <h2>Fetching animes...</h2>
            </div>
          </section>
        ) : animeList.length === 0 ? (
          <section className="flex flex-col items-center justify-center flex-1">
            <div className="flex flex-col items-center justify-center gap-2">
              <img src="/loading.gif" className="w-32 h-32 rounded-xl" />
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
