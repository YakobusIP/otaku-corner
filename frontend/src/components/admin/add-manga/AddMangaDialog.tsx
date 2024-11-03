// Components import
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useState, Dispatch, SetStateAction } from "react";
import { PlusIcon, Loader2Icon } from "lucide-react";
import { Manga } from "@tutkli/jikan-ts";
import SearchMangaJikan from "@/components/admin/add-manga/SearchMangaJikan";
import { addMangaService } from "@/services/manga.service";
import MangaSmallCard from "@/components/admin/add-manga/MangaSmallCard";

type Props = {
  openDialog: boolean;
  setOpenDialog: Dispatch<SetStateAction<boolean>>;
  resetParent: () => Promise<void>;
};

export default function AddMangaDialog({
  openDialog,
  setOpenDialog,
  resetParent
}: Props) {
  const [selectedManga, setSelectedManga] = useState<Manga[]>([]);
  const [isLoadingAddManga, setIsLoadingAddManga] = useState(false);

  const toast = useToast();

  const addManga = async () => {
    setIsLoadingAddManga(true);
    const data = selectedManga.map((manga) => ({
      malId: manga.mal_id,
      status: manga.status,
      title: manga.title,
      titleJapanese: manga.title_japanese,
      titleSynonyms: manga.title_synonyms
        ? manga.title_synonyms.map((synonym) => synonym.toLowerCase()).join(" ")
        : "",
      published:
        manga.status === "Upcoming"
          ? manga.status
          : `${new Date(manga.published.from).toLocaleDateString("en-US", {
              day: "numeric",
              month: "short",
              year: "numeric"
            })} to ${
              manga.published.to
                ? new Date(manga.published.to).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                  })
                : "?"
            }`,
      chaptersCount: manga.chapters,
      volumesCount: manga.volumes,
      score: manga.score,
      images: {
        image_url: manga.images.webp
          ? manga.images.webp.image_url
          : manga.images.jpg.image_url,
        large_image_url: manga.images.webp
          ? manga.images.webp.large_image_url
          : manga.images.jpg.large_image_url,
        small_image_url: manga.images.webp
          ? manga.images.webp.small_image_url
          : manga.images.jpg.small_image_url
      },
      authors: manga.authors.map((author) => author.name),
      genres: manga.genres.map((genre) => genre.name),
      themes: manga.themes.map((theme) => theme.name),
      synopsis: manga.synopsis ? manga.synopsis : "No synopsis available",
      malUrl: manga.url
    }));

    const response = await addMangaService(data);
    if (response.success) {
      toast.toast({
        title: "All set!",
        description: response.data.message
      });

      setSelectedManga([]);
      resetParent();
      setOpenDialog(false);
    } else {
      toast.toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: response.error
      });
    }
    setIsLoadingAddManga(false);
  };

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger asChild>
        <Button className="w-full xl:w-fit">
          <PlusIcon className="mr-2 w-4 h-4" />
          Add Manga
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full xl:w-3/5">
        <DialogHeader>
          <DialogTitle>Add new manga entry</DialogTitle>
          <DialogDescription>
            Data pulled from MAL using Jikan API
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-1 w-[calc(100dvw-3rem)] md:w-auto">
          <Label>Manga Title</Label>
          <SearchMangaJikan
            selectedManga={selectedManga}
            setSelectedManga={setSelectedManga}
          />
        </div>
        <div className="flex flex-wrap w-full gap-4 items-center">
          {selectedManga.map((manga) => {
            return (
              <MangaSmallCard
                manga={manga}
                setSelectedManga={setSelectedManga}
              />
            );
          })}
        </div>
        {selectedManga.length > 0 && (
          <Button onClick={addManga}>
            {isLoadingAddManga && (
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            )}
            Add Manga(s)
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
