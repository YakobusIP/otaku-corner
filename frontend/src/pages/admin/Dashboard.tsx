import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { FilterIcon, Search } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Separator } from "@/components/ui/separator";
import AddAnimeDialog from "@/components/admin/add-anime/AddAnimeDialog";
import { useToast } from "@/components/ui/use-toast";
import { AnimeFilterSort, AnimeList } from "@/types/anime.type";
import DataTable from "@/components/admin/data-table/DataTable";
import { animeColumns } from "@/components/admin/data-table/AnimeTableColumns";
import { useDebounce } from "use-debounce";
import {
  fetchAllAnimeService,
  deleteAnimeService
} from "@/services/anime.service";
import { MetadataResponse } from "@/types/api.type";
import { SortOrder } from "@/enum/general.enum";
import AnimeFilterSortAccordion from "@/components/global/AnimeFilterSortAccordion";
import { GenreEntity, StudioEntity, ThemeEntity } from "@/types/entity.type";
import {
  fetchAllGenreService,
  fetchAllStudioService,
  fetchAllThemeService
} from "@/services/entity.service";
import AddMangaDialog from "@/components/admin/add-manga/AddMangaDialog";

const PAGINATION_SIZE = 10;

export default function Dashboard() {
  const [openAddAnimeDialog, setOpenAddAnimeDialog] = useState(false);
  const [addedAnimeList, setAddedAnimeList] = useState<AnimeList[]>([]);
  const [animeMetadata, setAnimeMetadata] = useState<MetadataResponse>();
  const [genreList, setGenreList] = useState<GenreEntity[]>([]);
  const [studioList, setStudioList] = useState<StudioEntity[]>([]);
  const [themeList, setThemeList] = useState<ThemeEntity[]>([]);

  const [isLoadingAnime, setIsLoadingAnime] = useState(false);
  const [isLoadingGenre, setIsLoadingGenre] = useState(false);
  const [isLoadingStudio, setIsLoadingStudio] = useState(false);
  const [isLoadingTheme, setIsLoadingTheme] = useState(false);
  const [isLoadingDeleteAnime, setIsLoadingDeleteAnime] = useState(false);

  const [selectedAnimeRows, setSelectedAnimeRows] = useState({});
  const [animeListPage, setAnimeListPage] = useState(1);
  const [animeFilterSort, setAnimeFilterSort] = useState<AnimeFilterSort>({
    sortBy: "title",
    sortOrder: SortOrder.ASCENDING
  });

  const [openAddMangaDialog, setOpenAddMangaDialog] = useState(false);

  const [searchMedia, setSearchMedia] = useState("");
  const [debouncedSearch] = useDebounce(searchMedia, 1000);

  const toast = useToast();

  const toastRef = useRef(toast.toast);

  const fetchAnimeList = useCallback(async () => {
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
  }, [animeListPage, debouncedSearch, animeFilterSort]);

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

  const resetParent = useCallback(async () => {
    await fetchAnimeList();
    await fetchGenreList();
    await fetchStudioList();
    await fetchThemeList();
  }, [fetchAnimeList, fetchGenreList, fetchStudioList, fetchThemeList]);

  useEffect(() => {
    resetParent();
  }, [resetParent]);

  return (
    <div className="flex flex-col min-h-[100dvh]">
      <header className="bg-background border-b px-4 py-3 lg:px-6 lg:py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Input
            type="text"
            placeholder="Search"
            startIcon={Search}
            className="w-full lg:w-[300px]"
            onChange={(e) => setSearchMedia(e.target.value)}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <FilterIcon className="w-4 h-4" />
                <span className="sr-only lg:not-sr-only lg:whitespace-nowrap">
                  Filter
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>Filter by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem>Anime</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Manga</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Light Novels</DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <AddAnimeDialog
            openAddAnimeDialog={openAddAnimeDialog}
            setOpenAddAnimeDialog={setOpenAddAnimeDialog}
            resetParent={resetParent}
          />
          <AddMangaDialog
            openAddMangaDialog={openAddMangaDialog}
            setOpenAddMangaDialog={setOpenAddMangaDialog}
            resetParent={resetParent}
          />
        </div>
      </header>
      <Separator />
      <main className="flex-1">
        <section className="py-12 md:py-16 lg:py-20">
          <div className="container space-y-2">
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
          </div>
        </section>
      </main>
    </div>
  );
}
