// Components import
import { Dispatch, SetStateAction, useState } from "react";

import { addLightNovelService } from "@/services/lightnovel.service";

import LightNovelSmallCard from "@/components/add-lightnovel/LightNovelSmallCard";
import SearchLightNovelJikan from "@/components/add-lightnovel/SearchLightNovelJikan";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

import { useToast } from "@/hooks/useToast";
import useWideScreen from "@/hooks/useWideScreen";

import { Manga } from "@tutkli/jikan-ts";
import { BookIcon, Loader2Icon } from "lucide-react";

type Props = {
  openDialog: boolean;
  setOpenDialog: Dispatch<SetStateAction<boolean>>;
  resetParent: () => Promise<void>;
};

export default function AddLightNovelDialog({
  openDialog,
  setOpenDialog,
  resetParent
}: Props) {
  const toast = useToast();
  const isWideScreen = useWideScreen();

  const [selectedLightNovel, setSelectedLightNovel] = useState<Manga[]>([]);
  const [isLoadingAddLightNovel, setIsLoadingAddLightNovel] = useState(false);

  const addLightNovel = async () => {
    setIsLoadingAddLightNovel(true);
    const data = selectedLightNovel.map((lightNovel) => ({
      malId: lightNovel.mal_id,
      status: lightNovel.status,
      title: lightNovel.title,
      titleJapanese: lightNovel.title_japanese,
      titleSynonyms: lightNovel.title_synonyms
        ? lightNovel.title_synonyms
            .map((synonym) => synonym.toLowerCase())
            .join(" ")
        : "",
      published:
        lightNovel.status === "Upcoming"
          ? lightNovel.status
          : `${new Date(lightNovel.published.from).toLocaleDateString("en-US", {
              day: "numeric",
              month: "short",
              year: "numeric"
            })} to ${
              lightNovel.published.to
                ? new Date(lightNovel.published.to).toLocaleDateString(
                    "en-US",
                    {
                      day: "numeric",
                      month: "short",
                      year: "numeric"
                    }
                  )
                : "?"
            }`,
      volumesCount: lightNovel.volumes,
      score: lightNovel.score,
      images: {
        image_url: lightNovel.images.webp
          ? lightNovel.images.webp.image_url
          : lightNovel.images.jpg.image_url,
        large_image_url: lightNovel.images.webp
          ? lightNovel.images.webp.large_image_url
          : lightNovel.images.jpg.large_image_url,
        small_image_url: lightNovel.images.webp
          ? lightNovel.images.webp.small_image_url
          : lightNovel.images.jpg.small_image_url
      },
      authors: lightNovel.authors.map((author) => author.name),
      genres: lightNovel.genres.map((genre) => genre.name),
      themes: lightNovel.themes.map((theme) => theme.name),
      synopsis: lightNovel.synopsis
        ? lightNovel.synopsis
        : "No synopsis available",
      malUrl: lightNovel.url
    }));

    const response = await addLightNovelService(data);
    if (response.success) {
      toast.toast({
        title: "All set!",
        description: response.data.message
      });

      setSelectedLightNovel([]);
      resetParent();
      setOpenDialog(false);
    } else {
      toast.toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: response.error
      });
    }
    setIsLoadingAddLightNovel(false);
  };

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger asChild>
        <Button
          className="w-full xl:w-fit"
          variant={isWideScreen ? "default" : "outline"}
        >
          <BookIcon className="w-4 h-4" />
          Add Light Novel
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full xl:w-3/5">
        <DialogHeader>
          <DialogTitle>Add new light novel entry</DialogTitle>
          <DialogDescription>
            Data pulled from MAL using Jikan API
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-1 w-[calc(100dvw-3rem)] md:w-auto">
          <Label>Light Novel Title</Label>
          <SearchLightNovelJikan
            selectedLightNovel={selectedLightNovel}
            setSelectedLightNovel={setSelectedLightNovel}
          />
        </div>
        <ScrollArea className="max-h-96">
          <div className="flex flex-wrap w-full gap-4 items-center">
            {selectedLightNovel.map((lightNovel) => {
              return (
                <LightNovelSmallCard
                  lightNovel={lightNovel}
                  setSelectedLightNovel={setSelectedLightNovel}
                />
              );
            })}
          </div>
        </ScrollArea>
        {selectedLightNovel.length > 0 && (
          <Button onClick={addLightNovel}>
            {isLoadingAddLightNovel && (
              <Loader2Icon className="w-4 h-4 animate-spin" />
            )}
            Add Light Novel(s)
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
