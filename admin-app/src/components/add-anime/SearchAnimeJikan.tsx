import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";

import { Button } from "@/components/ui/button";
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

import { useToast } from "@/hooks/useToast";

import { cn } from "@/lib/utils";

import { Anime, AnimeClient } from "@tutkli/jikan-ts";
import { CheckIcon, ChevronDownIcon, Loader2Icon } from "lucide-react";
import { useDebounce } from "use-debounce";

type Props = {
  selectedAnime: Anime[];
  setSelectedAnime: Dispatch<SetStateAction<Anime[]>>;
};

const animeClient = new AnimeClient();

export default function SearchAnimeJikan({
  selectedAnime,
  setSelectedAnime
}: Props) {
  const toast = useToast();
  const toastRef = useRef(toast.toast);
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [isLoadingAnimeList, setIsLoadingAnimeList] = useState(false);
  const [searchAnime, setSearchAnime] = useState("");
  const [debouncedSearch] = useDebounce(searchAnime, 1000);

  const fetchAnimeList = useCallback(async () => {
    setIsLoadingAnimeList(true);
    try {
      const response = await animeClient.getAnimeSearch({
        limit: 10,
        q: debouncedSearch
      });
      setAnimeList(response.data);
    } catch (error) {
      toastRef.current({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: "Failed to fetch anime list from Jikan"
      });
    } finally {
      setIsLoadingAnimeList(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    fetchAnimeList();
  }, [fetchAnimeList]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between"
        >
          <p className="truncate">Select anime...</p>
          <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="popover-content-width-full p-0">
        <Command
          filter={(value, search) => {
            const parsedValue: Anime = JSON.parse(value);
            if (
              parsedValue.title.toLowerCase().includes(search.toLowerCase()) ||
              parsedValue.title_english
                ?.toLocaleLowerCase()
                .includes(search.toLowerCase()) ||
              parsedValue.title_synonyms.some((synonym) =>
                synonym.toLowerCase().includes(search.toLowerCase())
              )
            )
              return 1;
            return 0;
          }}
        >
          <CommandInput
            placeholder="Search anime..."
            value={searchAnime}
            onValueChange={setSearchAnime}
          />
          <CommandList>
            {!isLoadingAnimeList && (
              <CommandEmpty>No anime found.</CommandEmpty>
            )}
            {isLoadingAnimeList && (
              <CommandLoading>
                <div className="flex items-center justify-center gap-2">
                  <Loader2Icon className="h-4 w-4 animate-spin" />
                  Loading...
                </div>
              </CommandLoading>
            )}
            <CommandGroup>
              {animeList.map((anime) => {
                return (
                  <CommandItem
                    key={anime.mal_id}
                    value={JSON.stringify(anime)}
                    onSelect={(currentValue) => {
                      const parsedValue: Anime = JSON.parse(currentValue);
                      setSelectedAnime((prev) => [...prev, parsedValue]);
                    }}
                  >
                    <CheckIcon
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedAnime &&
                          selectedAnime.some(
                            (selected) => selected.mal_id === anime.mal_id
                          )
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    <p className="whitespace-normal">
                      {anime.title} - {new Date(anime.aired.from).getFullYear()}
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
