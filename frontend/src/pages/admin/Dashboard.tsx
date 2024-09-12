import { useCallback, useEffect, useRef, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { DropdownChecked } from "@/components/ui/dropdown-menu";
import { Search } from "lucide-react";
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
  fetchAllAuthorService,
  fetchAllGenreService,
  fetchAllStudioService,
  fetchAllThemeService
} from "@/services/entity.service";
import {
  AuthorEntity,
  GenreEntity,
  StudioEntity,
  ThemeEntity
} from "@/types/entity.type";
import { MetadataResponse } from "@/types/api.type";
import { SortOrder } from "@/enum/general.enum";
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
    sortOrder: SortOrder.ASCENDING
  });

  const [selectedMangaRows, setSelectedMangaRows] = useState({});
  const [mangaListPage, setMangaListPage] = useState(1);
  const [mangaFilterSort, setMangaFilterSort] = useState<MangaFilterSort>({
    sortBy: "title",
    sortOrder: SortOrder.ASCENDING
  });

  const [selectedLightNovelRows, setSelectedLightNovelRows] = useState({});
  const [lightNovelListPage, setLightNovelListPage] = useState(1);
  const [lightNovelFilterSort, setLightNovelFilterSort] =
    useState<LightNovelFilterSort>({
      sortBy: "title",
      sortOrder: SortOrder.ASCENDING
    });

  const [searchMedia, setSearchMedia] = useState("");
  const [debouncedSearch] = useDebounce(searchMedia, 1100);

  const toast = useToast();

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
      animeFilterSort.sortOrder,
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
      mangaFilterSort.filterPersonalScore
    );
    if (response.success) {
      setAddedMangaList(response.data.data);
      setMangaMetadata(response.data.metadata);
    } else {
      toastRef.current({
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
      lightNovelFilterSort.filterPersonalScore
    );
    if (response.success) {
      setAddedLightNovelList(response.data.data);
      setLightNovelMetadata(response.data.metadata);
    } else {
      toastRef.current({
        title: "Uh oh! Something went wrong",
        description: response.error
      });
    }
    setIsLoadingLightNovel(false);
  }, [mediaFilters, lightNovelListPage, debouncedSearch, lightNovelFilterSort]);

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

  const fetchAuthorList = useCallback(async () => {
    setIsLoadingAuthor(true);
    const response = await fetchAllAuthorService();
    if (response.success) {
      setAuthorList(response.data);
    } else {
      toastRef.current({
        title: "Uh oh! Something went wrong",
        description: response.error
      });
    }
    setIsLoadingAuthor(false);
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

  const deleteAnime = async () => {
    setIsLoadingDeleteAnime(true);
    const deletedIds = Object.keys(selectedAnimeRows).map((selected) =>
      parseInt(selected)
    );
    const response = await deleteAnimeService(deletedIds);
    if (response.success) {
      fetchAnimeList();
      toast.toast({
        title: "All set!",
        description: `${deletedIds.length} anime(s) deleted successfully`
      });
    } else {
      toast.toast({
        title: "Uh oh! Something went wrong",
        description: "There was a problem with your request."
      });
    }
    setSelectedAnimeRows({});
    setIsLoadingDeleteAnime(false);
  };

  const deleteManga = async () => {
    setIsLoadingDeleteManga(true);
    const deletedIds = Object.keys(selectedMangaRows).map((selected) =>
      parseInt(selected)
    );
    const response = await deleteMangaService(deletedIds);
    if (response.success) {
      fetchMangaList();
      toast.toast({
        title: "All set!",
        description: `${deletedIds.length} manga(s) deleted successfully`
      });
    } else {
      toast.toast({
        title: "Uh oh! Something went wrong",
        description: "There was a problem with your request."
      });
    }
    setSelectedMangaRows({});
    setIsLoadingDeleteManga(false);
  };

  const deleteLightNovel = async () => {
    setIsLoadingDeleteLightNovel(true);
    const deletedIds = Object.keys(selectedLightNovelRows).map((selected) =>
      parseInt(selected)
    );
    const response = await deleteLightNovelService(deletedIds);
    if (response.success) {
      fetchLightNovelList();
      toast.toast({
        title: "All set!",
        description: `${deletedIds.length} light novel(s) deleted successfully`
      });
    } else {
      toast.toast({
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
    if (mediaFilters[1]) fetchMangaList();
    if (mediaFilters[2]) fetchLightNovelList();
  }, [mediaFilters, fetchAnimeList, fetchMangaList, fetchLightNovelList]);

  useEffect(() => {
    resetFilter();
  }, [resetFilter]);

  return (
    <div className="flex flex-col min-h-[100dvh]">
      <header className="bg-background border-b px-4 py-3 lg:px-6 lg:py-4">
        <div className="flex flex-col lg:flex-row items-center w-full gap-4">
          <div className="flex w-full lg:w-fit gap-4">
            <Input
              type="text"
              placeholder="Search"
              startIcon={Search}
              parentClassName="w-full lg:w-fit"
              className="w-full lg:w-[300px]"
              onChange={(e) => setSearchMedia(e.target.value)}
            />
            <MediaFilter
              mediaFilters={mediaFilters}
              handleMediaFilters={handleMediaFilters}
            />
          </div>
          <AddAnimeDialog
            openAddAnimeDialog={openAddAnimeDialog}
            setOpenAddAnimeDialog={setOpenAddAnimeDialog}
            resetParent={resetAnimeParent}
          />
          <AddMangaDialog
            openAddMangaDialog={openAddMangaDialog}
            setOpenAddMangaDialog={setOpenAddMangaDialog}
            resetParent={resetMangaParent}
          />
          <AddLightNovelDialog
            openAddLightNovelDialog={openAddLightNovelDialog}
            setOpenAddLightNovelDialog={setOpenAddLightNovelDialog}
            resetParent={resetLightNovelParent}
          />
        </div>
      </header>
      <Separator />
      <main className="flex-1">
        <section className="py-12 md:py-16 lg:py-20">
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
            {mediaFilters[0] && mediaFilters[1] && <Separator />}
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
            {mediaFilters[0] && mediaFilters[2] && <Separator />}
            {mediaFilters[1] && mediaFilters[2] && <Separator />}
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
