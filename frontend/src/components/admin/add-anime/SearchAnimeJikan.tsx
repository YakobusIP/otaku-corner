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
import {
  Anime,
  AnimeClient,
  AnimeEpisode,
  JikanResponse
} from "@tutkli/jikan-ts";
import { useEffect, useState, Dispatch, SetStateAction } from "react";
import { useDebounce } from "use-debounce";

type Props = {
  chosenAnime?: Anime;
  setChosenAnime: Dispatch<SetStateAction<Anime | undefined>>;
  setChosenAnimeEpisode: Dispatch<SetStateAction<AnimeEpisode[]>>;
  setIsLoadingChosenAnime: Dispatch<SetStateAction<boolean>>;
};

export default function SearchAnimeJikan({
  chosenAnime,
  setChosenAnime,
  setChosenAnimeEpisode,
  setIsLoadingChosenAnime
}: Props) {
  const [openAnimeList, setOpenAnimeList] = useState(false);
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [isLoadingAnimeList, setIsLoadingAnimeList] = useState(false);
  const [searchAnime, setSearchAnime] = useState("");
  const [debouncedSearch] = useDebounce(searchAnime, 1000);

  useEffect(() => {
    const animeClient = new AnimeClient();
    setIsLoadingAnimeList(true);
    animeClient
      .getAnimeSearch({ limit: 10, q: debouncedSearch })
      .then((response: JikanResponse<Anime[]>) => {
        setAnimeList(response.data);
      })
      .finally(() => {
        setIsLoadingAnimeList(false);
      });
  }, [debouncedSearch]);

  const fetchAnimeDetail = (id: string) => {
    const animeClient = new AnimeClient();
    setIsLoadingChosenAnime(true);
    animeClient
      .getAnimeById(parseInt(id))
      .then((response: JikanResponse<Anime>) => {
        setChosenAnime(response.data);

        animeClient
          .getAnimeEpisodes(response.data.mal_id)
          .then((response: JikanResponse<AnimeEpisode[]>) => {
            setChosenAnimeEpisode(response.data);
          });
      })
      .finally(() => {
        setIsLoadingChosenAnime(false);
      });
  };

  return (
    <Popover open={openAnimeList} onOpenChange={setOpenAnimeList}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={openAnimeList}
          className="w-full justify-between"
        >
          <p className="truncate">
            {chosenAnime
              ? `${chosenAnime.title} - ${new Date(
                  chosenAnime.aired.from
                ).getFullYear()}`
              : "Select anime..."}
          </p>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
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
                  <Loader2 className="h-4 w-4 animate-spin" />
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
                      fetchAnimeDetail(parsedValue.mal_id.toString());
                      setOpenAnimeList(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        chosenAnime && chosenAnime.mal_id === anime.mal_id
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
