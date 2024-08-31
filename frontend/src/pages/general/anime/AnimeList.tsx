import { Input } from "@/components/ui/input";
import { useCallback, useEffect, useRef, useState } from "react";
import { SortOrder } from "@/enum/general.enum";
import SortDirection from "@/components/general/anime/anime-list/SortDirection";
import FilterGenre from "@/components/general/anime/anime-list/FilterGenre";
import FilterMALScore from "@/components/general/anime/anime-list/FilterMALScore";
import AnimeCard from "@/components/general/anime/anime-list/AnimeCard";
import FilterType from "@/components/general/anime/anime-list/FilterType";
import { useToast } from "@/components/ui/use-toast";
import { fetchAllAnimeService } from "@/services/anime.service";
import { useDebounce } from "use-debounce";
import { type AnimeList } from "@/types/anime.type";
import { Loader2 } from "lucide-react";
import {
  fetchAllGenreService,
  fetchAllStudioService,
  fetchAllThemeService
} from "@/services/entity.service";
import { GenreEntity, StudioEntity, ThemeEntity } from "@/types/entity.type";
import FilterStudio from "@/components/general/anime/anime-list/FilterStudio";
import FilterTheme from "@/components/general/anime/anime-list/FilterTheme";
import FilterPersonalScore from "@/components/general/anime/anime-list/FilterPersonalScore";

export default function AnimeList() {
  const [animeList, setAnimeList] = useState<AnimeList[]>([]);
  const [genreList, setGenreList] = useState<GenreEntity[]>([]);
  const [studioList, setStudioList] = useState<StudioEntity[]>([]);
  const [themeList, setThemeList] = useState<ThemeEntity[]>([]);

  const [sortBy, setSortBy] = useState("title");
  const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.ASCENDING);
  const [filterGenre, setFilterGenre] = useState<number>();
  const [filterStudio, setFilterStudio] = useState<number>();
  const [filterTheme, setFilterTheme] = useState<number>();
  const [filterMALScore, setFilterMALScore] = useState<string>();
  const [filterPersonalScore, setFilterPersonalScore] = useState<string>();
  const [filterType, setFilterType] = useState<string>();

  const [isLoadingAnime, setIsLoadingAnime] = useState(false);
  const [isLoadingGenre, setIsLoadingGenre] = useState(false);
  const [isLoadingStudio, setIsLoadingStudio] = useState(false);
  const [isLoadingTheme, setIsLoadingTheme] = useState(false);

  const [searchAnime, setSearchAnime] = useState("");
  const [debouncedSearch] = useDebounce(searchAnime, 1000);

  const toast = useToast();

  const toastRef = useRef(toast.toast);

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder(
        sortOrder === SortOrder.ASCENDING
          ? SortOrder.DESCENDING
          : SortOrder.ASCENDING
      );
    } else {
      setSortBy(key);
      setSortOrder(SortOrder.ASCENDING);
    }
  };

  const handleFilterGenre = (key?: number) => {
    setFilterGenre(key);
  };

  const handleFilterStudio = (key?: number) => {
    setFilterStudio(key);
  };

  const handleFilterTheme = (key?: number) => {
    setFilterTheme(key);
  };

  const handleFilterMALScore = (key?: string) => {
    setFilterMALScore(key);
  };

  const handleFilterPersonalScore = (key?: string) => {
    setFilterPersonalScore(key);
  };

  const handleFilterType = (key?: string) => {
    setFilterType(key);
  };

  const fetchAnimeList = useCallback(async () => {
    setIsLoadingAnime(true);
    const response = await fetchAllAnimeService(
      debouncedSearch,
      sortBy,
      sortOrder,
      filterGenre,
      filterStudio,
      filterTheme,
      filterMALScore,
      filterPersonalScore,
      filterType
    );
    if (response.success) {
      setAnimeList(response.data);
    } else {
      toastRef.current({
        title: "Uh oh! Something went wrong",
        description: response.error
      });
    }
    setIsLoadingAnime(false);
  }, [
    debouncedSearch,
    sortBy,
    sortOrder,
    filterGenre,
    filterStudio,
    filterTheme,
    filterMALScore,
    filterPersonalScore,
    filterType
  ]);

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
  }, [fetchAnimeList, fetchGenreList, fetchStudioList, fetchThemeList]);

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
      <main className="container py-12 px-4 md:px-6 flex flex-col flex-1">
        <section className="mb-4">
          <div className="grid grid-cols-2 grid-rows-2 lg:flex items-center gap-4">
            <SortDirection
              sortBy={sortBy}
              sortOrder={sortOrder}
              handleSort={handleSort}
            />
            <FilterGenre
              genreList={genreList}
              isLoadingGenre={isLoadingGenre}
              filterGenre={filterGenre}
              handleFilterGenre={handleFilterGenre}
            />
            <FilterStudio
              studioList={studioList}
              isLoadingStudio={isLoadingStudio}
              filterStudio={filterStudio}
              handleFilterStudio={handleFilterStudio}
            />
            <FilterTheme
              themeList={themeList}
              isLoadingTheme={isLoadingTheme}
              filterTheme={filterTheme}
              handleFilterTheme={handleFilterTheme}
            />
            <FilterMALScore
              filterMALScore={filterMALScore}
              handleFilterMALScore={handleFilterMALScore}
            />
            <FilterPersonalScore
              filterPersonalScore={filterPersonalScore}
              handleFilterPersonalScore={handleFilterPersonalScore}
            />
            <FilterType
              filterType={filterType}
              handleFilterType={handleFilterType}
            />
          </div>
        </section>
        {isLoadingAnime && (
          <section className="flex flex-col items-center justify-center flex-1">
            <div className="flex items-center justify-center gap-2 lg:gap-4">
              <Loader2 className="w-8 h-8 lg:w-16 lg:h-16 animate-spin" />
              <h2>Fetching animes...</h2>
            </div>
          </section>
        )}
        {!isLoadingAnime && (
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
