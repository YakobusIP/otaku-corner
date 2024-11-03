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
  useCallback,
  useRef
} from "react";
import { useDebounce } from "use-debounce";
import { useToast } from "@/components/ui/use-toast";

type Props = {
  selectedLightNovel: Manga[];
  setSelectedLightNovel: Dispatch<SetStateAction<Manga[]>>;
};

const mangaClient = new MangaClient();

export default function SearchLightNovelJikan({
  selectedLightNovel,
  setSelectedLightNovel
}: Props) {
  const toast = useToast();
  const toastRef = useRef(toast.toast);
  const [lightNovelList, setLightNovelList] = useState<Manga[]>([]);
  const [isLoadingLightNovelList, setIsLoadingLightNovelList] = useState(false);
  const [searchLightNovel, setSearchLightNovel] = useState("");
  const [debouncedSearch] = useDebounce(searchLightNovel, 1000);

  const fetchLightNovelList = useCallback(async () => {
    setIsLoadingLightNovelList(true);
    try {
      const response = await mangaClient.getMangaSearch({
        limit: 10,
        q: debouncedSearch,
        type: "Lightnovel"
      });
      setLightNovelList(response.data);
    } catch (error) {
      toastRef.current({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: "Failed to fetch light novel list from Jikan"
      });
    } finally {
      setIsLoadingLightNovelList(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    fetchLightNovelList();
  }, [fetchLightNovelList]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between"
        >
          <p className="truncate">Select light novel...</p>
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
                      setSelectedLightNovel((prev) => [...prev, parsedValue]);
                    }}
                  >
                    <CheckIcon
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedLightNovel &&
                          selectedLightNovel.some(
                            (selected) => selected.mal_id === lightNovel.mal_id
                          )
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
