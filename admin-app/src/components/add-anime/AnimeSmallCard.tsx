import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";

import { fetchAnimeDuplicate } from "@/services/anime.service";

import { Button } from "@/components/ui/button";

import { useToast } from "@/hooks/useToast";

import { cn } from "@/lib/utils";

import { Anime } from "@tutkli/jikan-ts";
import { XIcon } from "lucide-react";

type Props = {
  anime: Anime;
  setSelectedAnime: Dispatch<SetStateAction<Anime[]>>;
};

export default function AnimeSmallCard({ anime, setSelectedAnime }: Props) {
  const toast = useToast();
  const toastRef = useRef(toast.toast);
  const duplicateCheckedRef = useRef(false);
  const [isDuplicate, setIsDuplicate] = useState(false);

  const checkAnimeDuplicate = useCallback(async () => {
    const response = await fetchAnimeDuplicate(anime.mal_id);

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
  }, [anime.mal_id]);

  const removeAnimeFromList = () => {
    setSelectedAnime((prev) =>
      prev.filter((existing) => existing.mal_id !== anime.mal_id)
    );
  };

  useEffect(() => {
    if (!duplicateCheckedRef.current) checkAnimeDuplicate();

    return () => {
      duplicateCheckedRef.current = false;
    };
  }, [checkAnimeDuplicate]);

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
        onClick={removeAnimeFromList}
      >
        <XIcon className="w-4 h-4" />
      </Button>
      <img
        src={
          anime.images.webp
            ? anime.images.webp.image_url
            : anime.images.jpg.image_url
        }
        className="w-16 h-24 rounded-md"
      />
      <div className="flex flex-col justify-center">
        <p className="font-bold line-clamp-2">{anime.title}</p>
        <p className="text-muted-foreground text-xs line-clamp-1">
          {anime.title_japanese}
        </p>
      </div>
      {isDuplicate ? (
        <p className="absolute text-xs text-destructive bottom-2 right-2">
          Anime already exists!
        </p>
      ) : (
        <p className="absolute text-xs text-green-700 bottom-2 right-2">
          Not yet added!
        </p>
      )}
    </div>
  );
}
