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
import { ChevronDownIcon, CheckIcon, Loader2Icon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Manga, MangaClient } from "@tutkli/jikan-ts";
import {
  useEffect,
  useState,
  Dispatch,
  SetStateAction,
  useRef,
  useCallback
} from "react";
import { useDebounce } from "use-debounce";
import { useToast } from "@/components/ui/use-toast";

type Props = {
  selectedManga: Manga[];
  setSelectedManga: Dispatch<SetStateAction<Manga[]>>;
};

const mangaClient = new MangaClient();

export default function SearchMangaJikan({
  selectedManga,
  setSelectedManga
}: Props) {
  const toast = useToast();
  const toastRef = useRef(toast.toast);
  const [mangaList, setMangaList] = useState<Manga[]>([]);
  const [isLoadingMangaList, setIsLoadingMangaList] = useState(false);
  const [searchManga, setSearchManga] = useState("");
  const [debouncedSearch] = useDebounce(searchManga, 1000);

  const fetchMangaList = useCallback(async () => {
    setIsLoadingMangaList(true);
    try {
      const response = await mangaClient.getMangaSearch({
        limit: 10,
        q: debouncedSearch,
        type: "Manga"
      });
      setMangaList(response.data);
    } catch (error) {
      toastRef.current({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: "Failed to fetch manga list from Jikan"
      });
    } finally {
      setIsLoadingMangaList(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    fetchMangaList();
  }, [fetchMangaList]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between"
        >
          <p className="truncate">Select manga...</p>
          <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
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
                  <Loader2Icon className="h-4 w-4 animate-spin" />
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
                      setSelectedManga((prev) => [...prev, parsedValue]);
                    }}
                  >
                    <CheckIcon
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedManga &&
                          selectedManga.some(
                            (selected) => selected.mal_id === manga.mal_id
                          )
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
