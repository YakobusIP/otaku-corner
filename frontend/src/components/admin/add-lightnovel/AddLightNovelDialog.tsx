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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

import { useState, Dispatch, SetStateAction } from "react";
import { Plus, ExternalLink, Star, Loader2 } from "lucide-react";
import { Manga } from "@tutkli/jikan-ts";
import SearchLightNovelJikan from "@/components/admin/add-lightnovel/SearchLightNovelJikan";
import { LightNovelPostRequest } from "@/types/lightnovel.type";
import { addLightNovelService } from "@/services/lightnovel.service";

type Props = {
  openAddLightNovelDialog: boolean;
  setOpenAddLightNovelDialog: Dispatch<SetStateAction<boolean>>;
  resetParent: () => Promise<void>;
};

export default function AddLightNovelDialog({
  openAddLightNovelDialog,
  setOpenAddLightNovelDialog,
  resetParent
}: Props) {
  const [isLoadingChosenLightNovel, setIsLoadingChosenLightNovel] =
    useState(false);
  const [chosenLightNovel, setChosenLightNovel] = useState<Manga>();
  const [isLoadingAddLightNovel, setIsLoadingAddLightNovel] = useState(false);

  const toast = useToast();

  const addLightNovel = async (data: Manga) => {
    setIsLoadingAddLightNovel(true);
    const lightNovel: LightNovelPostRequest = {
      malId: data.mal_id,
      status: data.status,
      title: data.title,
      titleJapanese: data.title_japanese,
      titleSynonyms: data.title_synonyms
        ? data.title_synonyms.map((synonym) => synonym.toLowerCase()).join(" ")
        : "",
      published:
        data.status === "Upcoming"
          ? data.status
          : `${new Date(data.published.from).toLocaleDateString("en-US", {
              day: "numeric",
              month: "short",
              year: "numeric"
            })} to ${
              data.published.to
                ? new Date(data.published.to).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                  })
                : "?"
            }`,
      chaptersCount: data.chapters,
      volumesCount: data.volumes,
      score: data.score,
      images: {
        image_url: data.images.webp
          ? data.images.webp.image_url
          : data.images.jpg.image_url,
        large_image_url: data.images.webp
          ? data.images.webp.large_image_url
          : data.images.jpg.large_image_url,
        small_image_url: data.images.webp
          ? data.images.webp.small_image_url
          : data.images.jpg.small_image_url
      },
      authors: data.authors.map((author) => author.name),
      genres: data.genres.map((genre) => genre.name),
      themes: data.themes.map((theme) => theme.name),
      synopsis: data.synopsis,
      malUrl: data.url
    };

    const response = await addLightNovelService(lightNovel);
    if (response.success) {
      toast.toast({
        title: "All set!",
        description: response.data.message
      });

      setChosenLightNovel(undefined);
      resetParent();
      setOpenAddLightNovelDialog(false);
    } else {
      toast.toast({
        title: "Uh oh! Something went wrong",
        description: response.error
      });
    }
    setIsLoadingAddLightNovel(false);
  };

  return (
    <Dialog
      open={openAddLightNovelDialog}
      onOpenChange={setOpenAddLightNovelDialog}
    >
      <DialogTrigger asChild>
        <Button className="w-full lg:w-fit">
          <Plus className="mr-2 w-4 h-4" />
          Add Light Novel
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full lg:w-3/5">
        <DialogHeader>
          <DialogTitle>Add new light novel entry</DialogTitle>
          <DialogDescription>
            Data pulled from MAL using Jikan API
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-1 w-[calc(100dvw-3rem)] md:w-auto">
          <Label>Light Novel Title</Label>
          <SearchLightNovelJikan
            chosenLightNovel={chosenLightNovel}
            setChosenLightNovel={setChosenLightNovel}
            setIsLoadingChosenLightNovel={setIsLoadingChosenLightNovel}
          />
        </div>
        {isLoadingChosenLightNovel && (
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Fetching light novel details...
          </div>
        )}
        {!isLoadingChosenLightNovel && chosenLightNovel && (
          <>
            <div className="flex flex-col lg:flex-row w-full space-x-0 lg:space-x-4 items-center">
              <img
                src={
                  chosenLightNovel.images.webp
                    ? chosenLightNovel.images.webp.image_url
                    : chosenLightNovel.images.jpg.image_url
                }
                className="object-cover rounded-lg h-fit w-[100px] lg:w-[300px]"
              />
              <Separator orientation="vertical" className="hidden lg:block" />
              <ScrollArea className="h-full lg:h-[400px] w-full p-0 lg:p-2">
                <div className="flex flex-col space-y-4 w-full p-0 lg:p-2">
                  <h4>Light Novel Details</h4>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center w-full">
                    <div className="flex flex-col">
                      <Label>Title</Label>
                      <p className="break-words">{chosenLightNovel.title}</p>
                    </div>
                    <div className="flex flex-col">
                      <Label>Title (Japanese)</Label>
                      <p className="break-words">
                        {chosenLightNovel.title_japanese}
                      </p>
                    </div>
                    <div className="flex flex-col">
                      <Label>Published</Label>
                      <p>
                        {chosenLightNovel.status === "Upcoming"
                          ? chosenLightNovel.status
                          : `${new Date(
                              chosenLightNovel.published.from
                            ).toLocaleDateString("en-US", {
                              day: "numeric",
                              month: "short",
                              year: "numeric"
                            })} to ${
                              chosenLightNovel.published.to
                                ? new Date(
                                    chosenLightNovel.published.to
                                  ).toLocaleDateString("en-US", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric"
                                  })
                                : "?"
                            }`}
                      </p>
                    </div>
                    <div className="flex flex-col">
                      <Label>Chapters</Label>
                      <p>{chosenLightNovel.chapters ?? "Unknown"}</p>
                    </div>
                    <div className="flex flex-col">
                      <Label>Volumes</Label>
                      <p>{chosenLightNovel.volumes ?? "Unknown"}</p>
                    </div>
                    <div className="flex flex-col">
                      <Label>MAL Score</Label>
                      <span className="inline-flex items-center gap-1">
                        <Star className="w-4 h-4" />
                        {chosenLightNovel.score ?? "N/A"}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <Label>MAL Entry</Label>
                      <a
                        href={chosenLightNovel.url}
                        className="inline-flex items-center gap-1 hover:underline hover:underline-offset-4"
                        target="_blank"
                      >
                        Visit MAL
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 col-span-1 lg:col-span-3 gap-4">
                      {chosenLightNovel.authors.length > 0 && (
                        <div className="flex flex-col gap-1">
                          <Label>Authors</Label>
                          <div className="flex flex-wrap gap-2 items-center">
                            {chosenLightNovel.authors.map((author) => {
                              return (
                                <Badge key={author.mal_id}>{author.name}</Badge>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      {chosenLightNovel.genres.length > 0 && (
                        <div className="flex flex-col gap-1">
                          <Label>Genres</Label>
                          <div className="flex flex-wrap gap-2 items-center">
                            {chosenLightNovel.genres.map((genre) => {
                              return (
                                <Badge key={genre.mal_id}>{genre.name}</Badge>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      {chosenLightNovel.themes.length > 0 && (
                        <div className="flex flex-col gap-1">
                          <Label>Themes</Label>
                          <div className="flex flex-wrap gap-2 items-center">
                            {chosenLightNovel.themes.map((theme) => {
                              return (
                                <Badge key={theme.mal_id}>{theme.name}</Badge>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-1 col-span-1 lg:col-span-3">
                      <Label>Synopsis</Label>
                      <Textarea
                        rows={7}
                        value={chosenLightNovel.synopsis}
                        readOnly
                        className="resize-none"
                      />
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </div>
            <Button onClick={() => addLightNovel(chosenLightNovel)}>
              {isLoadingAddLightNovel && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Add Light Novel
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
