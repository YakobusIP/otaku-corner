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
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";
import { AnimeList } from "@/types/anime.type";
import DataTable from "@/components/admin/data-table/DataTable";
import { columns } from "@/components/admin/data-table/TableColumns";

export default function Dashboard() {
  const [addedAnimeList, setAddedAnimeList] = useState<Array<AnimeList>>([]);
  const [openAddAnimeDialog, setOpenAddAnimeDialog] = useState(false);

  const toast = useToast();

  const toastRef = useRef(toast.toast);

  const fetchAnimeList = useCallback(async () => {
    try {
      const response = await axios.get("/api/anime");

      if (response.status === 200) {
        setAddedAnimeList(response.data.data);
      }
    } catch (error) {
      toastRef.current({
        title: "Uh oh! Something went wrong",
        description: "There was a problem with your request."
      });
    }
  }, []);

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
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
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
          />
        </div>
      </header>
      <Separator />
      <main className="flex-1">
        <section className="py-12 md:py-16 lg:py-20">
          <div className="container">
            <DataTable columns={columns} data={addedAnimeList} />
          </div>
        </section>
      </main>
    </div>
  );
}
