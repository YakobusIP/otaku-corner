import { useCallback, useEffect, useRef, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { DropdownChecked } from "@/components/ui/dropdown-menu";
import { Loader2, LogOut, Search } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import AddAnimeDialog from "@/components/admin/add-anime/AddAnimeDialog";
import AddMangaDialog from "@/components/admin/add-manga/AddMangaDialog";
import DataTable from "@/components/admin/data-table/DataTable";
import { animeColumns } from "@/components/admin/data-table/AnimeTableColumns";
import { mangaColumns } from "@/components/admin/data-table/MangaTableColumns";
import { useDebounce } from "use-debounce";
import {
  fetchAllAnimeService,
  deleteAnimeService
} from "@/services/anime.service";
import { AnimeFilterSort, AnimeList } from "@/types/anime.type";
import {
  deleteMangaService,
  fetchAllMangaService
} from "@/services/manga.service";
import { MangaFilterSort, MangaList } from "@/types/manga.type";
import {
  genreService,
  studioService,
  themeService,
  authorService
} from "@/services/entity.service";
import {
  AuthorEntity,
  GenreEntity,
  StudioEntity,
  ThemeEntity
} from "@/types/entity.type";
import { MetadataResponse } from "@/types/api.type";
import { SORT_ORDER } from "@/lib/enums";
import AnimeFilterSortAccordion from "@/components/global/AnimeFilterSortAccordion";
import MangaFilterSortAccordion from "@/components/global/MangaFilterSortAccordion";
import MediaFilter from "@/components/admin/MediaFilter";
import { LightNovelFilterSort, LightNovelList } from "@/types/lightnovel.type";
import {
  deleteLightNovelService,
  fetchAllLightNovelService
} from "@/services/lightnovel.service";
import { lightNovelColumns } from "@/components/admin/data-table/LightNovelTableColumns";
import LightNovelFilterSortAccordion from "@/components/global/LightNovelFilterSortAccordion";
import AddLightNovelDialog from "@/components/admin/add-lightnovel/AddLightNovelDialog";
import EntityManagement from "@/components/admin/entity-management/EntityManagement";
import { Button } from "@/components/ui/button";
import useWideScreen from "@/hooks/useWideScreen";
import { useNavigate } from "react-router-dom";
import { logout } from "@/services/auth.service";
import { setAccessToken } from "@/lib/axios";

const PAGINATION_SIZE = 5;

export default function Dashboard() {
  const [mediaFilters, setMediaFilters] = useState<DropdownChecked[]>([
    true,
    true,
    true
  ]);

  const [openAddAnimeDialog, setOpenAddAnimeDialog] = useState(false);
  const [addedAnimeList, setAddedAnimeList] = useState<AnimeList[]>([]);
  const [animeMetadata, setAnimeMetadata] = useState<MetadataResponse>();

  const [openAddMangaDialog, setOpenAddMangaDialog] = useState(false);
  const [addedMangaList, setAddedMangaList] = useState<MangaList[]>([]);
  const [mangaMetadata, setMangaMetadata] = useState<MetadataResponse>();

  const [openAddLightNovelDialog, setOpenAddLightNovelDialog] = useState(false);
  const [addedLightNovelList, setAddedLightNovelList] = useState<
    LightNovelList[]
  >([]);
  const [lightNovelMetadata, setLightNovelMetadata] =
    useState<MetadataResponse>();

  const [openEntityManagementDialog, setOpenEntityManagementDialog] =
    useState(false);

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
    SORT_ORDER: SORT_ORDER.ASCENDING
  });

  const [selectedMangaRows, setSelectedMangaRows] = useState({});
  const [mangaListPage, setMangaListPage] = useState(1);
  const [mangaFilterSort, setMangaFilterSort] = useState<MangaFilterSort>({
    sortBy: "title",
    SORT_ORDER: SORT_ORDER.ASCENDING
  });

  const [selectedLightNovelRows, setSelectedLightNovelRows] = useState({});
  const [lightNovelListPage, setLightNovelListPage] = useState(1);
  const [lightNovelFilterSort, setLightNovelFilterSort] =
    useState<LightNovelFilterSort>({
      sortBy: "title",
      SORT_ORDER: SORT_ORDER.ASCENDING
    });

  const [searchMedia, setSearchMedia] = useState("");
  const [debouncedSearch] = useDebounce(searchMedia, 1000);

  const [isLoadingLogout, setIsLoadingLogout] = useState(false);

  const toast = useToast();
  const navigate = useNavigate();
  const isWideScreen = useWideScreen();

  const toastRef = useRef(toast.toast);

  const handleMediaFilters = (index: number, checked: DropdownChecked) => {
    setMediaFilters((prevFilters) =>
      prevFilters.map((state, i) => (i === index ? checked : state))
    );
  };

  const fetchAnimeList = useCallback(async () => {
    if (!mediaFilters[0]) return;
    setIsLoadingAnime(true);
    const response = await fetchAllAnimeService(
      animeListPage,
      PAGINATION_SIZE,
      debouncedSearch,
      animeFilterSort.sortBy,
      animeFilterSort.SORT_ORDER,
      animeFilterSort.filterGenre,
      animeFilterSort.filterStudio,
      animeFilterSort.filterTheme,
      animeFilterSort.filterMALScore,
      animeFilterSort.filterPersonalScore,
      animeFilterSort.filterType
    );
    if (response.success) {
      setAddedAnimeList(response.data.data);
      setAnimeMetadata(response.data.metadata);
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
      mangaFilterSort.SORT_ORDER,
      mangaFilterSort.filterAuthor,
      mangaFilterSort.filterGenre,
      mangaFilterSort.filterTheme,
      mangaFilterSort.filterMALScore,
      mangaFilterSort.filterPersonalScore
    );
    if (response.success) {
      setAddedMangaList(response.data.data);
      setMangaMetadata(response.data.metadata);
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
      lightNovelFilterSort.SORT_ORDER,
      lightNovelFilterSort.filterAuthor,
      lightNovelFilterSort.filterGenre,
      lightNovelFilterSort.filterTheme,
      lightNovelFilterSort.filterMALScore,
      lightNovelFilterSort.filterPersonalScore
    );
    if (response.success) {
      setAddedLightNovelList(response.data.data);
      setLightNovelMetadata(response.data.metadata);
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

  const handleLogout = async () => {
    setIsLoadingLogout(true);
    const response = await logout();
    if (response.success) {
      setAccessToken(null);
      navigate("/");
      toast.toast({
        title: "All set!",
        description: response.data.message
      });
    } else {
      toast.toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: response.error
      });
    }
    setIsLoadingLogout(false);
  };

  const resetFilter = useCallback(async () => {
    await fetchGenreList();
    await fetchStudioList();
    await fetchThemeList();
    await fetchAuthorList();
  }, [fetchGenreList, fetchStudioList, fetchThemeList, fetchAuthorList]);

  const resetAnimeParent = useCallback(async () => {
    await fetchAnimeList();
    await fetchGenreList();
    await fetchStudioList();
    await fetchThemeList();
  }, [fetchAnimeList, fetchGenreList, fetchStudioList, fetchThemeList]);

  const resetMangaParent = useCallback(async () => {
    await fetchMangaList();
    await fetchAuthorList();
    await fetchGenreList();
    await fetchThemeList();
  }, [fetchMangaList, fetchAuthorList, fetchGenreList, fetchThemeList]);

  const resetLightNovelParent = useCallback(async () => {
    await fetchLightNovelList();
    await fetchAuthorList();
    await fetchGenreList();
    await fetchThemeList();
  }, [fetchLightNovelList, fetchAuthorList, fetchGenreList, fetchThemeList]);

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

  return (
    <div className="flex flex-col min-h-[100dvh]">
      <header className="bg-background border-b px-4 py-3 xl:px-6 xl:py-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col xl:flex-row items-center w-full gap-4">
            <div className="flex w-full xl:w-fit gap-2 xl:gap-4">
              <Input
                type="text"
                placeholder="Search"
                startIcon={Search}
                parentClassName="w-full xl:w-fit"
                className="w-full xl:w-[300px]"
                onChange={(e) => setSearchMedia(e.target.value)}
              />
              <MediaFilter
                mediaFilters={mediaFilters}
                handleMediaFilters={handleMediaFilters}
              />
              {!isWideScreen && (
                <Button variant="outline" onClick={handleLogout}>
                  {isLoadingLogout ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <LogOut className="w-4 h-4" />
                  )}
                </Button>
              )}
            </div>
            <AddAnimeDialog
              openDialog={openAddAnimeDialog}
              setOpenDialog={setOpenAddAnimeDialog}
              resetParent={resetAnimeParent}
            />
            <AddMangaDialog
              openDialog={openAddMangaDialog}
              setOpenDialog={setOpenAddMangaDialog}
              resetParent={resetMangaParent}
            />
            <AddLightNovelDialog
              openDialog={openAddLightNovelDialog}
              setOpenDialog={setOpenAddLightNovelDialog}
              resetParent={resetLightNovelParent}
            />
            <EntityManagement
              openDialog={openEntityManagementDialog}
              setOpenDialog={setOpenEntityManagementDialog}
              resetAuthor={fetchAuthorList}
              resetGenre={fetchGenreList}
              resetStudio={fetchStudioList}
              resetTheme={fetchThemeList}
            />
          </div>
          {isWideScreen && (
            <Button variant="outline" onClick={handleLogout}>
              {isLoadingLogout ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="mr-2 w-4 h-4" />
              )}
              Logout
            </Button>
          )}
        </div>
      </header>
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
