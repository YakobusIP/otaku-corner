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
import { Manga, MangaClient, JikanResponse } from "@tutkli/jikan-ts";
import { useEffect, useState, Dispatch, SetStateAction } from "react";
import { useDebounce } from "use-debounce";

type Props = {
  chosenLightNovel?: Manga;
  setChosenLightNovel: Dispatch<SetStateAction<Manga | undefined>>;
  setIsLoadingChosenLightNovel: Dispatch<SetStateAction<boolean>>;
};

export default function SearchLightNovelJikan({
  chosenLightNovel,
  setChosenLightNovel,
  setIsLoadingChosenLightNovel
}: Props) {
  const [openLightNovelList, setOpenLightNovelList] = useState(false);
  const [lightNovelList, setLightNovelList] = useState<Manga[]>([]);
  const [isLoadingLightNovelList, setIsLoadingLightNovelList] = useState(false);
  const [searchLightNovel, setSearchLightNovel] = useState("");
  const [debouncedSearch] = useDebounce(searchLightNovel, 1000);

  useEffect(() => {
    const mangaClient = new MangaClient();
    setIsLoadingLightNovelList(true);
    mangaClient
      .getMangaSearch({ limit: 10, q: debouncedSearch, type: "Lightnovel" })
      .then((response: JikanResponse<Manga[]>) => {
        setLightNovelList(response.data);
      })
      .finally(() => {
        setIsLoadingLightNovelList(false);
      });
  }, [debouncedSearch]);

  const fetchLightNovelDetail = (id: string) => {
    const mangaClient = new MangaClient();
    setIsLoadingChosenLightNovel(true);
    mangaClient
      .getMangaById(parseInt(id))
      .then((response: JikanResponse<Manga>) => {
        setChosenLightNovel(response.data);
      })
      .finally(() => {
        setIsLoadingChosenLightNovel(false);
      });
  };

  return (
    <Popover open={openLightNovelList} onOpenChange={setOpenLightNovelList}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={openLightNovelList}
          className="w-full justify-between"
        >
          <p className="truncate">
            {chosenLightNovel
              ? `${chosenLightNovel.title} - ${new Date(
                  chosenLightNovel.published.from
                ).getFullYear()}`
              : "Select light novel..."}
          </p>
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
            placeholder="Search light novel..."
            value={searchLightNovel}
            onValueChange={setSearchLightNovel}
          />
          <CommandList>
            {!isLoadingLightNovelList && (
              <CommandEmpty>No light novel found.</CommandEmpty>
            )}
            {isLoadingLightNovelList && (
              <CommandLoading>
                <div className="flex items-center justify-center gap-2">
                  <Loader2Icon className="h-4 w-4 animate-spin" />
                  Loading...
                </div>
              </CommandLoading>
            )}
            <CommandGroup>
              {lightNovelList.map((lightNovel) => {
                return (
                  <CommandItem
                    key={lightNovel.mal_id}
                    value={JSON.stringify(lightNovel)}
                    onSelect={(currentValue) => {
                      const parsedValue: Manga = JSON.parse(currentValue);
                      fetchLightNovelDetail(parsedValue.mal_id.toString());
                      setOpenLightNovelList(false);
                    }}
                  >
                    <CheckIcon
                      className={cn(
                        "mr-2 h-4 w-4",
                        chosenLightNovel &&
                          chosenLightNovel.mal_id === lightNovel.mal_id
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    <p className="whitespace-normal">
                      {lightNovel.title} -{" "}
                      {new Date(lightNovel.published.from).getFullYear()}
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
