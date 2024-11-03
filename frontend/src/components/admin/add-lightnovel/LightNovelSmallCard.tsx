import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { fetchLightNovelDuplicate } from "@/services/lightnovel.service";
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
  lightNovel: Manga;
  setSelectedLightNovel: Dispatch<SetStateAction<Manga[]>>;
};

export default function LightNovelSmallCard({
  lightNovel,
  setSelectedLightNovel
}: Props) {
  const toast = useToast();
  const toastRef = useRef(toast.toast);
  const duplicateCheckedRef = useRef(false);
  const [isDuplicate, setIsDuplicate] = useState(false);

  const checkLightNovelDuplicate = useCallback(async () => {
    const response = await fetchLightNovelDuplicate(
      lightNovel.mal_id.toString()
    );

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
  }, [lightNovel.mal_id]);

  const removeLightNovelFromList = () => {
    setSelectedLightNovel((prev) =>
      prev.filter((existing) => existing.mal_id !== lightNovel.mal_id)
    );
  };

  useEffect(() => {
    if (!duplicateCheckedRef.current) checkLightNovelDuplicate();

    return () => {
      duplicateCheckedRef.current = false;
    };
  }, [checkLightNovelDuplicate]);

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
        onClick={removeLightNovelFromList}
      >
        <XIcon className="w-4 h-4" />
      </Button>
      <img
        src={
          lightNovel.images.webp
            ? lightNovel.images.webp.image_url
            : lightNovel.images.jpg.image_url
        }
        className="w-16 h-24 rounded-md"
      />
      <div className="flex flex-col justify-center">
        <p className="font-bold">{lightNovel.title}</p>
        <p className="text-muted-foreground text-xs">
          {lightNovel.title_japanese}
        </p>
      </div>
      {isDuplicate ? (
        <p className="absolute text-xs text-destructive bottom-2 right-2">
          Light novel already exists!
        </p>
      ) : (
        <p className="absolute text-xs text-green-700 bottom-2 right-2">
          Not yet added!
        </p>
      )}
    </div>
  );
}
