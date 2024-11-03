import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { fetchMangaDuplicate } from "@/services/manga.service";
import { Manga } from "@tutkli/jikan-ts";
import { XIcon } from "lucide-react";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";

type Props = {
  manga: Manga;
  setSelectedManga: Dispatch<SetStateAction<Manga[]>>;
};

export default function MangaSmallCard({ manga, setSelectedManga }: Props) {
  const toast = useToast();
  const toastRef = useRef(toast.toast);
  const duplicateCheckedRef = useRef(false);
  const [isDuplicate, setIsDuplicate] = useState(false);

  const checkMangaDuplicate = useCallback(async () => {
    const response = await fetchMangaDuplicate(manga.mal_id.toString());

    if (response.success) {
      setIsDuplicate(response.data.exists);
      duplicateCheckedRef.current = true;
    } else {
      toastRef.current({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: response.error
      });
    }
  }, [manga.mal_id]);

  const removeMangaFromList = () => {
    setSelectedManga((prev) =>
      prev.filter((existing) => existing.mal_id !== manga.mal_id)
    );
  };

  useEffect(() => {
    if (!duplicateCheckedRef.current) checkMangaDuplicate();

    return () => {
      duplicateCheckedRef.current = false;
    };
  }, [checkMangaDuplicate]);

  return (
    <div
      className={cn(
        "relative flex items-center border p-2 gap-2 rounded-md",
        "w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.33%-0.67rem)] xl:w-[calc(25%-0.75rem)]",
        isDuplicate ? "border-destructive" : "border-green-700"
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-0 right-0"
        onClick={removeMangaFromList}
      >
        <XIcon className="w-4 h-4" />
      </Button>
      <img
        src={
          manga.images.webp
            ? manga.images.webp.image_url
            : manga.images.jpg.image_url
        }
        className="w-16 h-24 rounded-md"
      />
      <div className="flex flex-col justify-center">
        <p className="font-bold">{manga.title}</p>
        <p className="text-muted-foreground text-xs">{manga.title_japanese}</p>
      </div>
      {isDuplicate ? (
        <p className="absolute text-xs text-destructive bottom-2 right-2">
          Manga already exists!
        </p>
      ) : (
        <p className="absolute text-xs text-green-700 bottom-2 right-2">
          Not yet added!
        </p>
      )}
    </div>
  );
}
