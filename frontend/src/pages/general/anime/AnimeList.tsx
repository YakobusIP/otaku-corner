import { Input } from "@/components/ui/input";
import { useCallback, useEffect, useRef, useState } from "react";
import { SortOrder } from "@/enum/general.enum";
import AnimeCard from "@/components/general/anime/anime-list/AnimeCard";
import AnimeFilterSortAccordion from "@/components/global/AnimeFilterSortAccordion";
import { useToast } from "@/components/ui/use-toast";
import { fetchAllAnimeService } from "@/services/anime.service";
import { useDebounce } from "use-debounce";
import type { AnimeFilterSort, AnimeList } from "@/types/anime.type";
import { Loader2 } from "lucide-react";
import {
  fetchAllGenreService,
  fetchAllStudioService,
  fetchAllThemeService
} from "@/services/entity.service";
import { GenreEntity, StudioEntity, ThemeEntity } from "@/types/entity.type";
import { MetadataResponse } from "@/types/api.type";

const PAGINATION_SIZE = 10;

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

  const [currentPage, setCurrentPage] = useState(1);
  const [searchAnime, setSearchAnime] = useState("");
  const [debouncedSearch] = useDebounce(searchAnime, 1000);

  const toast = useToast();

  const toastRef = useRef(toast.toast);

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
  }, [currentPage, debouncedSearch, animeFilterSort]);

  const fetchGenreList = useCallback(async () => {
    setIsLoadingGenre(true);
    const response = await fetchAllGenreService();
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
    const response = await fetchAllStudioService();
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
    const response = await fetchAllThemeService();
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
  }, [fetchAnimeList]);

  useEffect(() => {
    fetchGenreList();
    fetchStudioList();
    fetchThemeList();
  }, [fetchGenreList, fetchStudioList, fetchThemeList]);

  return (
    <div className="flex flex-col min-h-[100dvh]">
      <header className="bg-primary text-primary-foreground py-8 px-4 md:px-6">
        <div className="container">
          <div className="flex flex-col gap-4">
            <h1 className="max-w-[650px]">Anime Watchlist</h1>
            <h4 className="text-primary-foreground/80 max-w-[650px]">
              Discover my watched animes
            </h4>
            <div className="mt-6">
              <Input
                type="text"
                placeholder="Search for an anime..."
                className="w-full max-w-md bg-primary-foreground/10 border-none focus:ring-0 focus:border-none"
                onChange={(e) => setSearchAnime(e.target.value)}
              />
            </div>
          </div>
        </div>
      </header>
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
          <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {animeList.map((anime) => {
              return <AnimeCard key={anime.id} anime={anime} />;
            })}
          </section>
        )}
      </main>
      <footer className="bg-muted py-6 text-muted-foreground">
        <div className="container flex items-center justify-between">
          <p className="text-sm">
            &copy; {new Date().getFullYear()} Otaku Corner
          </p>
        </div>
      </footer>
    </div>
  );
}
