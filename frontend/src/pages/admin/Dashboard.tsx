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
import { AnimeList } from "@/types/anime.type";
import DataTable from "@/components/admin/data-table/DataTable";
import { animeColumns } from "@/components/admin/data-table/AnimeTableColumns";
import { useDebounce } from "use-debounce";
import {
  fetchAllAnimeService,
  deleteAnimeService
} from "@/services/anime.service";

export default function Dashboard() {
  const [addedAnimeList, setAddedAnimeList] = useState<Array<AnimeList>>([]);
  const [openAddAnimeDialog, setOpenAddAnimeDialog] = useState(false);
  const [isLoadingDeleteAnime, setIsLoadingDeleteAnime] = useState(false);
  const [selectedAnimeRows, setSelectedAnimeRows] = useState({});
  const [searchMedia, setSearchMedia] = useState("");
  const [debouncedSearch] = useDebounce(searchMedia, 1000);

  const toast = useToast();

  const toastRef = useRef(toast.toast);

  const fetchAnimeList = useCallback(async () => {
    setIsLoadingDeleteAnime(true);
    const response = await fetchAllAnimeService(debouncedSearch);
    if (response.success) {
      setAddedAnimeList(response.data);
    } else {
      toastRef.current({
        title: "Uh oh! Something went wrong",
        description: response.error
      });
    }
    setIsLoadingDeleteAnime(false);
  }, [debouncedSearch]);

  const deleteAnime = async () => {
    setIsLoadingDeleteAnime(true);
    const response = await deleteAnimeService(Object.keys(selectedAnimeRows));
    if (response.success) {
      fetchAnimeList();
    } else {
      toast.toast({
        title: "Uh oh! Something went wrong",
        description: "There was a problem with your request."
      });
    }
    setSelectedAnimeRows({});
    setIsLoadingDeleteAnime(false);
  };

  useEffect(() => {
    fetchAnimeList();
  }, [fetchAnimeList]);

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
            fetchAnimeList={fetchAnimeList}
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
              isLoadingDeleteData={isLoadingDeleteAnime}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
