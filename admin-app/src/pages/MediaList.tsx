import {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";

import {
  deleteAnimeService,
  fetchAllAnimeService
} from "@/services/anime.service";
import {
  authorService,
  genreService,
  studioService,
  themeService
} from "@/services/entity.service";
import {
  deleteLightNovelService,
  fetchAllLightNovelService
} from "@/services/lightnovel.service";
import {
  deleteMangaService,
  fetchAllMangaService
} from "@/services/manga.service";

import { animeColumns } from "@/components/data-table/AnimeTableColumns";
import DataTable from "@/components/data-table/DataTable";
import { lightNovelColumns } from "@/components/data-table/LightNovelTableColumns";
import { mangaColumns } from "@/components/data-table/MangaTableColumns";
import AnimeFilterSortAccordion from "@/components/filter-accordions/AnimeFilterSortAccordion";
import LightNovelFilterSortAccordion from "@/components/filter-accordions/LightNovelFilterSortAccordion";
import MangaFilterSortAccordion from "@/components/filter-accordions/MangaFilterSortAccordion";
import { DropdownChecked } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

import { useToast } from "@/hooks/useToast";

import { AnimeFilterSort, AnimeList } from "@/types/anime.type";
import { MetadataResponse } from "@/types/api.type";
import {
  AuthorEntity,
  GenreEntity,
  StudioEntity,
  ThemeEntity
} from "@/types/entity.type";
import { LightNovelFilterSort, LightNovelList } from "@/types/lightnovel.type";
import { MangaFilterSort, MangaList } from "@/types/manga.type";

import { SORT_ORDER } from "@/lib/enums";

import { useDebounce } from "use-debounce";

const PAGINATION_SIZE = 5;

export default function MediaList() {
  const MediaListNavbar = lazy(() => import("@/components/MediaListNavbar"));
  const [mediaFilters, setMediaFilters] = useState<DropdownChecked[]>([
    true,
    true,
    true
  ]);

  const [addedAnimeList, setAddedAnimeList] = useState<AnimeList[]>([]);
  const [animeMetadata, setAnimeMetadata] = useState<MetadataResponse>();

  const [addedMangaList, setAddedMangaList] = useState<MangaList[]>([]);
  const [mangaMetadata, setMangaMetadata] = useState<MetadataResponse>();

  const [addedLightNovelList, setAddedLightNovelList] = useState<
    LightNovelList[]
  >([]);
  const [lightNovelMetadata, setLightNovelMetadata] =
    useState<MetadataResponse>();

  const [genreList, setGenreList] = useState<GenreEntity[]>([]);
  const [studioList, setStudioList] = useState<StudioEntity[]>([]);
  const [themeList, setThemeList] = useState<ThemeEntity[]>([]);
  const [authorList, setAuthorList] = useState<AuthorEntity[]>([]);

  const [isLoadingAnime, setIsLoadingAnime] = useState(false);
  const [isLoadingManga, setIsLoadingManga] = useState(false);
  const [isLoadingLightNovel, setIsLoadingLightNovel] = useState(false);
  const [isLoadingGenre, setIsLoadingGenre] = useState(false);
  const [isLoadingStudio, setIsLoadingStudio] = useState(false);
  const [isLoadingTheme, setIsLoadingTheme] = useState(false);
  const [isLoadingAuthor, setIsLoadingAuthor] = useState(false);
  const [isLoadingDeleteAnime, setIsLoadingDeleteAnime] = useState(false);
  const [isLoadingDeleteManga, setIsLoadingDeleteManga] = useState(false);
  const [isLoadingDeleteLightNovel, setIsLoadingDeleteLightNovel] =
    useState(false);

  const [selectedAnimeRows, setSelectedAnimeRows] = useState({});
  const [animeListPage, setAnimeListPage] = useState(1);
  const [animeFilterSort, setAnimeFilterSort] = useState<AnimeFilterSort>({
    sortBy: "title",
    sortOrder: SORT_ORDER.ASCENDING
  });

  const [selectedMangaRows, setSelectedMangaRows] = useState({});
  const [mangaListPage, setMangaListPage] = useState(1);
  const [mangaFilterSort, setMangaFilterSort] = useState<MangaFilterSort>({
    sortBy: "title",
    sortOrder: SORT_ORDER.ASCENDING
  });

  const [selectedLightNovelRows, setSelectedLightNovelRows] = useState({});
  const [lightNovelListPage, setLightNovelListPage] = useState(1);
  const [lightNovelFilterSort, setLightNovelFilterSort] =
    useState<LightNovelFilterSort>({
      sortBy: "title",
      sortOrder: SORT_ORDER.ASCENDING
    });

  const [searchMedia, setSearchMedia] = useState("");
  const [debouncedSearch] = useDebounce(searchMedia, 1000);

  const toast = useToast();

  const toastRef = useRef(toast.toast);

  const fetchAnimeList = useCallback(async () => {
    if (!mediaFilters[0]) return;
    setIsLoadingAnime(true);
    const response = await fetchAllAnimeService(
      animeListPage,
      PAGINATION_SIZE,
      debouncedSearch,
      animeFilterSort.sortBy,
      animeFilterSort.sortOrder,
      animeFilterSort.filterGenre,
      animeFilterSort.filterStudio,
      animeFilterSort.filterTheme,
      animeFilterSort.filterMALScore,
      animeFilterSort.filterPersonalScore,
      animeFilterSort.filterType,
      animeFilterSort.filterStatusCheck
    );
    if (response.success) {
      setAddedAnimeList(response.data.data);
      setAnimeMetadata(response.data.metadata);

      if (debouncedSearch) {
        setAnimeListPage(1);
      }
    } else {
      toastRef.current({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: response.error
      });
    }
    setIsLoadingAnime(false);
  }, [mediaFilters, animeListPage, debouncedSearch, animeFilterSort]);

  const fetchMangaList = useCallback(async () => {
    if (!mediaFilters[1]) return;
    setIsLoadingManga(true);
    const response = await fetchAllMangaService(
      mangaListPage,
      PAGINATION_SIZE,
      debouncedSearch,
      mangaFilterSort.sortBy,
      mangaFilterSort.sortOrder,
      mangaFilterSort.filterAuthor,
      mangaFilterSort.filterGenre,
      mangaFilterSort.filterTheme,
      mangaFilterSort.filterMALScore,
      mangaFilterSort.filterPersonalScore,
      mangaFilterSort.filterStatusCheck
    );
    if (response.success) {
      setAddedMangaList(response.data.data);
      setMangaMetadata(response.data.metadata);

      if (debouncedSearch) {
        setMangaListPage(1);
      }
    } else {
      toastRef.current({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: response.error
      });
    }
    setIsLoadingManga(false);
  }, [mediaFilters, mangaListPage, debouncedSearch, mangaFilterSort]);

  const fetchLightNovelList = useCallback(async () => {
    if (!mediaFilters[2]) return;
    setIsLoadingLightNovel(true);
    const response = await fetchAllLightNovelService(
      lightNovelListPage,
      PAGINATION_SIZE,
      debouncedSearch,
      lightNovelFilterSort.sortBy,
      lightNovelFilterSort.sortOrder,
      lightNovelFilterSort.filterAuthor,
      lightNovelFilterSort.filterGenre,
      lightNovelFilterSort.filterTheme,
      lightNovelFilterSort.filterMALScore,
      lightNovelFilterSort.filterPersonalScore,
      lightNovelFilterSort.filterStatusCheck
    );
    if (response.success) {
      setAddedLightNovelList(response.data.data);
      setLightNovelMetadata(response.data.metadata);

      if (debouncedSearch) {
        setLightNovelListPage(1);
      }
    } else {
      toastRef.current({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: response.error
      });
    }
    setIsLoadingLightNovel(false);
  }, [mediaFilters, lightNovelListPage, debouncedSearch, lightNovelFilterSort]);

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

  const deleteAnime = async () => {
    setIsLoadingDeleteAnime(true);
    const deletedIds = Object.keys(selectedAnimeRows);
    const response = await deleteAnimeService(deletedIds);
    if (response.success) {
      fetchAnimeList();
      toast.toast({
        title: "All set!",
        description: `${deletedIds.length} anime(s) deleted successfully`
      });
    } else {
      toast.toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: "There was a problem with your request."
      });
    }
    setSelectedAnimeRows({});
    setIsLoadingDeleteAnime(false);
  };

  const deleteManga = async () => {
    setIsLoadingDeleteManga(true);
    const deletedIds = Object.keys(selectedMangaRows);
    const response = await deleteMangaService(deletedIds);
    if (response.success) {
      fetchMangaList();
      toast.toast({
        title: "All set!",
        description: `${deletedIds.length} manga(s) deleted successfully`
      });
    } else {
      toast.toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: "There was a problem with your request."
      });
    }
    setSelectedMangaRows({});
    setIsLoadingDeleteManga(false);
  };

  const deleteLightNovel = async () => {
    setIsLoadingDeleteLightNovel(true);
    const deletedIds = Object.keys(selectedLightNovelRows);
    const response = await deleteLightNovelService(deletedIds);
    if (response.success) {
      fetchLightNovelList();
      toast.toast({
        title: "All set!",
        description: `${deletedIds.length} light novel(s) deleted successfully`
      });
    } else {
      toast.toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: "There was a problem with your request."
      });
    }
    setSelectedLightNovelRows({});
    setIsLoadingDeleteLightNovel(false);
  };

  const resetFilter = useCallback(async () => {
    await fetchGenreList();
    await fetchStudioList();
    await fetchThemeList();
    await fetchAuthorList();
  }, [fetchGenreList, fetchStudioList, fetchThemeList, fetchAuthorList]);

  useEffect(() => {
    if (mediaFilters[0]) fetchAnimeList();
  }, [mediaFilters, fetchAnimeList]);

  useEffect(() => {
    if (mediaFilters[1]) fetchMangaList();
  }, [mediaFilters, fetchMangaList]);

  useEffect(() => {
    if (mediaFilters[2]) fetchLightNovelList();
  }, [mediaFilters, fetchLightNovelList]);

  useEffect(() => {
    resetFilter();
  }, [resetFilter]);

  useEffect(() => {
    document.title = "Media List | Otaku Corner Admin";
  }, []);

  return (
    <div className="flex flex-col min-h-[100dvh]">
      <Suspense>
        <MediaListNavbar
          mediaFilters={mediaFilters}
          setMediaFilters={setMediaFilters}
          setSearchMedia={setSearchMedia}
          fetchAnimeList={fetchAnimeList}
          fetchGenreList={fetchGenreList}
          fetchStudioList={fetchStudioList}
          fetchThemeList={fetchThemeList}
          fetchMangaList={fetchMangaList}
          fetchAuthorList={fetchAuthorList}
          fetchLightNovelList={fetchLightNovelList}
        />
      </Suspense>
      <Separator />
      <main className="flex-1">
        <section className="pb-12 pt-8 md:py-16 xl:py-20">
          <div className="container space-y-4">
            {mediaFilters[0] && (
              <DataTable
                title="Anime"
                columns={animeColumns}
                data={addedAnimeList}
                rowSelection={selectedAnimeRows}
                setRowSelection={setSelectedAnimeRows}
                deleteData={deleteAnime}
                isLoadingData={isLoadingAnime}
                isLoadingDeleteData={isLoadingDeleteAnime}
                page={animeListPage}
                setPage={setAnimeListPage}
                metadata={animeMetadata}
                filterSortComponent={
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
                }
              />
            )}
            {mediaFilters[1] && (
              <DataTable
                title="Manga"
                columns={mangaColumns}
                data={addedMangaList}
                rowSelection={selectedMangaRows}
                setRowSelection={setSelectedMangaRows}
                deleteData={deleteManga}
                isLoadingData={isLoadingManga}
                isLoadingDeleteData={isLoadingDeleteManga}
                page={mangaListPage}
                setPage={setMangaListPage}
                metadata={mangaMetadata}
                filterSortComponent={
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
                }
              />
            )}
            {mediaFilters[2] && (
              <DataTable
                title="Light Novel"
                columns={lightNovelColumns}
                data={addedLightNovelList}
                rowSelection={selectedLightNovelRows}
                setRowSelection={setSelectedLightNovelRows}
                deleteData={deleteLightNovel}
                isLoadingData={isLoadingLightNovel}
                isLoadingDeleteData={isLoadingDeleteLightNovel}
                page={lightNovelListPage}
                setPage={setLightNovelListPage}
                metadata={lightNovelMetadata}
                filterSortComponent={
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
                }
              />
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
