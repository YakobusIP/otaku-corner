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
import SearchMangaJikan from "@/components/admin/add-manga/SearchMangaJikan";
import { MangaPostRequest } from "@/types/manga.type";
import { addMangaService } from "@/services/manga.service";

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
  const [isLoadingChosenManga, setIsLoadingChosenManga] = useState(false);
  const [chosenManga, setChosenManga] = useState<Manga>();
  const [isLoadingAddManga, setIsLoadingAddManga] = useState(false);

  const toast = useToast();

  const addManga = async (data: Manga) => {
    setIsLoadingAddManga(true);
    const manga: MangaPostRequest = {
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

    const response = await addMangaService(manga);
    if (response.success) {
      toast.toast({
        title: "All set!",
        description: response.data.message
      });

      setChosenManga(undefined);
      resetParent();
      setOpenDialog(false);
    } else {
      toast.toast({
        title: "Uh oh! Something went wrong",
        description: response.error
      });
    }
    setIsLoadingAddManga(false);
  };

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger asChild>
        <Button className="w-full lg:w-fit">
          <Plus className="mr-2 w-4 h-4" />
          Add Manga
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full lg:w-3/5">
        <DialogHeader>
          <DialogTitle>Add new manga entry</DialogTitle>
          <DialogDescription>
            Data pulled from MAL using Jikan API
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-1 w-[calc(100dvw-3rem)] md:w-auto">
          <Label>Manga Title</Label>
          <SearchMangaJikan
            chosenManga={chosenManga}
            setChosenManga={setChosenManga}
            setIsLoadingChosenManga={setIsLoadingChosenManga}
          />
        </div>
        {isLoadingChosenManga && (
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Fetching manga details...
          </div>
        )}
        {!isLoadingChosenManga && chosenManga && (
          <>
            <div className="flex flex-col lg:flex-row w-full space-x-0 lg:space-x-4 items-center">
              <img
                src={
                  chosenManga.images.webp
                    ? chosenManga.images.webp.image_url
                    : chosenManga.images.jpg.image_url
                }
                className="object-cover rounded-lg h-fit w-[100px] lg:w-[300px]"
              />
              <Separator orientation="vertical" className="hidden lg:block" />
              <ScrollArea className="h-full lg:h-[400px] w-full p-0 lg:p-2">
                <div className="flex flex-col space-y-4 w-full p-0 lg:p-2">
                  <h4>Manga Details</h4>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center w-full">
                    <div className="flex flex-col">
                      <Label>Title</Label>
                      <p className="break-words">{chosenManga.title}</p>
                    </div>
                    <div className="flex flex-col">
                      <Label>Title (Japanese)</Label>
                      <p className="break-words">
                        {chosenManga.title_japanese}
                      </p>
                    </div>
                    <div className="flex flex-col">
                      <Label>Published</Label>
                      <p>
                        {chosenManga.status === "Upcoming"
                          ? chosenManga.status
                          : `${new Date(
                              chosenManga.published.from
                            ).toLocaleDateString("en-US", {
                              day: "numeric",
                              month: "short",
                              year: "numeric"
                            })} to ${
                              chosenManga.published.to
                                ? new Date(
                                    chosenManga.published.to
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
                      <p>{chosenManga.chapters ?? "Unknown"}</p>
                    </div>
                    <div className="flex flex-col">
                      <Label>Volumes</Label>
                      <p>{chosenManga.volumes ?? "Unknown"}</p>
                    </div>
                    <div className="flex flex-col">
                      <Label>MAL Score</Label>
                      <span className="inline-flex items-center gap-1">
                        <Star className="w-4 h-4" />
                        {chosenManga.score ?? "N/A"}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <Label>MAL Entry</Label>
                      <a
                        href={chosenManga.url}
                        className="inline-flex items-center gap-1 hover:underline hover:underline-offset-4"
                        target="_blank"
                      >
                        Visit MAL
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 col-span-1 lg:col-span-3 gap-4">
                      {chosenManga.authors.length > 0 && (
                        <div className="flex flex-col gap-1">
                          <Label>Authors</Label>
                          <div className="flex flex-wrap gap-2 items-center">
                            {chosenManga.authors.map((author) => {
                              return (
                                <Badge key={author.mal_id}>{author.name}</Badge>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      {chosenManga.genres.length > 0 && (
                        <div className="flex flex-col gap-1">
                          <Label>Genres</Label>
                          <div className="flex flex-wrap gap-2 items-center">
                            {chosenManga.genres.map((genre) => {
                              return (
                                <Badge key={genre.mal_id}>{genre.name}</Badge>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      {chosenManga.themes.length > 0 && (
                        <div className="flex flex-col gap-1">
                          <Label>Themes</Label>
                          <div className="flex flex-wrap gap-2 items-center">
                            {chosenManga.themes.map((theme) => {
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
                        value={chosenManga.synopsis}
                        readOnly
                        className="resize-none"
                      />
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </div>
            <Button onClick={() => addManga(chosenManga)}>
              {isLoadingAddManga && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Add Manga
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
