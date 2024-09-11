import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandLoading
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ChevronDown, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Manga, MangaClient, JikanResponse } from "@tutkli/jikan-ts";
import { useEffect, useState, Dispatch, SetStateAction } from "react";
import { useDebounce } from "use-debounce";

type Props = {
  chosenManga?: Manga;
  setChosenManga: Dispatch<SetStateAction<Manga | undefined>>;
  setIsLoadingChosenManga: Dispatch<SetStateAction<boolean>>;
};

export default function SearchMangaJikan({
  chosenManga,
  setChosenManga,
  setIsLoadingChosenManga
}: Props) {
  const [openMangaList, setOpenMangaList] = useState(false);
  const [mangaList, setMangaList] = useState<Manga[]>([]);
  const [isLoadingMangaList, setIsLoadingMangaList] = useState(false);
  const [searchManga, setSearchManga] = useState("");
  const [debouncedSearch] = useDebounce(searchManga, 1000);

  useEffect(() => {
    const mangaClient = new MangaClient();
    setIsLoadingMangaList(true);
    mangaClient
      .getMangaSearch({ limit: 10, q: debouncedSearch, type: "Manga" })
      .then((response: JikanResponse<Manga[]>) => {
        setMangaList(response.data);
      })
      .finally(() => {
        setIsLoadingMangaList(false);
      });
  }, [debouncedSearch]);

  const fetchMangaDetail = (id: string) => {
    const mangaClient = new MangaClient();
    setIsLoadingChosenManga(true);
    mangaClient
      .getMangaById(parseInt(id))
      .then((response: JikanResponse<Manga>) => {
        setChosenManga(response.data);
      })
      .finally(() => {
        setIsLoadingChosenManga(false);
      });
  };

  return (
    <Popover open={openMangaList} onOpenChange={setOpenMangaList}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={openMangaList}
          className="w-full justify-between"
        >
          <p className="truncate">
            {chosenManga
              ? `${chosenManga.title} - ${new Date(
                  chosenManga.published.from
                ).getFullYear()}`
              : "Select manga..."}
          </p>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="popover-content-width-full p-0">
        <Command
          filter={(value, search) => {
            const parsedValue: Manga = JSON.parse(value);
            if (
              parsedValue.title.toLowerCase().includes(search.toLowerCase()) ||
              parsedValue.title_english
                ?.toLocaleLowerCase()
                .includes(search.toLowerCase()) ||
              parsedValue.title_synonyms?.some((synonym) =>
                synonym.toLowerCase().includes(search.toLowerCase())
              )
            )
              return 1;
            return 0;
          }}
        >
          <CommandInput
            placeholder="Search manga..."
            value={searchManga}
            onValueChange={setSearchManga}
          />
          <CommandList>
            {!isLoadingMangaList && (
              <CommandEmpty>No manga found.</CommandEmpty>
            )}
            {isLoadingMangaList && (
              <CommandLoading>
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </div>
              </CommandLoading>
            )}
            <CommandGroup>
              {mangaList.map((manga) => {
                return (
                  <CommandItem
                    key={manga.mal_id}
                    value={JSON.stringify(manga)}
                    onSelect={(currentValue) => {
                      const parsedValue: Manga = JSON.parse(currentValue);
                      fetchMangaDetail(parsedValue.mal_id.toString());
                      setOpenMangaList(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        chosenManga && chosenManga.mal_id === manga.mal_id
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    <p className="whitespace-normal">
                      {manga.title} -{" "}
                      {new Date(manga.published.from).getFullYear()}
                    </p>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
