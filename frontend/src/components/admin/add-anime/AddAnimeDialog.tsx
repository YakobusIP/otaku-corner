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
import { Anime, AnimeEpisode } from "@tutkli/jikan-ts";
import SearchAnimeJikan from "@/components/admin/add-anime/SearchAnimeJikan";
import { AnimePostRequest } from "@/types/anime.type";
import { addAnimeService } from "@/services/anime.service";

type Props = {
  openDialog: boolean;
  setOpenDialog: Dispatch<SetStateAction<boolean>>;
  resetParent: () => Promise<void>;
};

export default function AddAnimeDialog({
  openDialog,
  setOpenDialog,
  resetParent
}: Props) {
  const [isLoadingChosenAnime, setIsLoadingChosenAnime] = useState(false);
  const [chosenAnime, setChosenAnime] = useState<Anime>();
  const [chosenAnimeEpisode, setChosenAnimeEpisode] = useState<AnimeEpisode[]>(
    []
  );
  const [isLoadingAddAnime, setIsLoadingAddAnime] = useState(false);

  const toast = useToast();

  const embedURL = chosenAnime?.trailer.embed_url?.replace(
    /(autoplay=)[^&]+/,
    "autoplay=0"
  );

  const addAnime = async (data: Anime) => {
    setIsLoadingAddAnime(true);
    const anime: AnimePostRequest = {
      malId: data.mal_id,
      type: data.type,
      status: data.status,
      rating: data.rating ?? "Unrated",
      season: data.season ? `${data.season.toUpperCase()} ${data.year}` : null,
      title: data.title,
      titleJapanese: data.title_japanese,
      titleSynonyms: data.title_synonyms
        .map((synonym) => synonym.toLowerCase())
        .join(" "),
      source: data.source,
      aired:
        data.type === "TV"
          ? data.status === "Not yet aired"
            ? data.status
            : `${new Date(data.aired.from).toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
                year: "numeric"
              })} to ${
                data.aired.to
                  ? new Date(data.aired.to).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric"
                    })
                  : "?"
              }`
          : `${new Date(data.aired.from).toLocaleDateString("en-US", {
              day: "numeric",
              month: "short",
              year: "numeric"
            })}`,
      broadcast: data.broadcast.string ?? "N/A",
      episodesCount: data.episodes,
      duration: data.duration,
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

      genres: data.genres.map((genre) => genre.name),
      studios: data.studios.map((studio) => studio.name),
      themes: data.themes.map((theme) => theme.name),
      episodes: chosenAnimeEpisode.map((episode) => ({
        aired: episode.aired
          ? new Date(episode.aired).toLocaleDateString("en-US", {
              day: "numeric",
              month: "short",
              year: "numeric"
            })
          : "N/A",
        number: episode.mal_id,
        title: episode.title,
        titleJapanese: episode.title_japanese,
        titleRomaji: episode.title_romanji
      })),
      synopsis: data.synopsis,
      trailer: embedURL,
      malUrl: data.url
    };

    const response = await addAnimeService(anime);
    if (response.success) {
      toast.toast({
        title: "All set!",
        description: response.data.message
      });

      setChosenAnime(undefined);
      resetParent();
      setOpenDialog(false);
    } else {
      toast.toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: response.error
      });
    }
    setIsLoadingAddAnime(false);
  };

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger asChild>
        <Button className="w-full xl:w-fit">
          <Plus className="mr-2 w-4 h-4" />
          Add Anime
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full xl:w-3/5">
        <DialogHeader>
          <DialogTitle>Add new anime entry</DialogTitle>
          <DialogDescription>
            Data pulled from MAL using Jikan API
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-1 w-[calc(100dvw-3rem)] md:w-auto">
          <Label>Anime Title</Label>
          <SearchAnimeJikan
            chosenAnime={chosenAnime}
            setChosenAnime={setChosenAnime}
            setChosenAnimeEpisode={setChosenAnimeEpisode}
            setIsLoadingChosenAnime={setIsLoadingChosenAnime}
          />
        </div>
        {isLoadingChosenAnime && (
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Fetching anime details...
          </div>
        )}
        {!isLoadingChosenAnime && chosenAnime && (
          <>
            <div className="flex flex-col xl:flex-row w-full space-x-0 xl:space-x-4 items-center">
              <img
                src={
                  chosenAnime.images.webp
                    ? chosenAnime.images.webp.image_url
                    : chosenAnime.images.jpg.image_url
                }
                className="object-cover rounded-xl h-fit w-[100px] xl:w-[300px]"
              />
              <Separator orientation="vertical" className="hidden xl:block" />
              <ScrollArea className="h-full xl:h-[400px] w-full p-0 xl:p-2">
                <div className="flex flex-col space-y-4 w-full p-0 xl:p-2">
                  <h4>Anime Details</h4>
                  <div className="flex items-center gap-2">
                    <Badge>{chosenAnime.type}</Badge>
                    <Badge>{chosenAnime.status}</Badge>
                    <Badge>{chosenAnime.rating ?? "Unrated"}</Badge>
                    {chosenAnime.season && (
                      <Badge>
                        {chosenAnime.season.toUpperCase()} {chosenAnime.year}
                      </Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 items-center w-full">
                    <div className="flex flex-col">
                      <Label>Title</Label>
                      <p className="break-words">{chosenAnime.title}</p>
                    </div>
                    <div className="flex flex-col">
                      <Label>Title (Japanese)</Label>
                      <p className="break-words">
                        {chosenAnime.title_japanese}
                      </p>
                    </div>
                    <div className="flex flex-col">
                      <Label>Source</Label>
                      <p>{chosenAnime.source}</p>
                    </div>
                    <div className="flex flex-col">
                      <Label>Aired</Label>
                      <p>
                        {chosenAnime.type === "TV"
                          ? chosenAnime.status === "Not yet aired"
                            ? chosenAnime.status
                            : `${new Date(
                                chosenAnime.aired.from
                              ).toLocaleDateString("en-US", {
                                day: "numeric",
                                month: "short",
                                year: "numeric"
                              })} to ${
                                chosenAnime.aired.to
                                  ? new Date(
                                      chosenAnime.aired.to
                                    ).toLocaleDateString("en-US", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric"
                                    })
                                  : "?"
                              }`
                          : new Date(chosenAnime.aired.from).toLocaleDateString(
                              "en-US",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric"
                              }
                            )}
                      </p>
                    </div>
                    <div className="flex flex-col">
                      <Label>Broadcast</Label>
                      <p>{chosenAnime.broadcast.string ?? "N/A"}</p>
                    </div>
                    <div className="flex flex-col">
                      <Label>Episodes</Label>
                      <p>{chosenAnime.episodes ?? "Unknown"}</p>
                    </div>
                    <div className="flex flex-col">
                      <Label>Duration</Label>
                      <p>{chosenAnime.duration}</p>
                    </div>
                    <div className="flex flex-col">
                      <Label>MAL Score</Label>
                      <span className="inline-flex items-center gap-1">
                        <Star className="w-4 h-4" />
                        {chosenAnime.score ?? "N/A"}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <Label>MAL Entry</Label>
                      <a
                        href={chosenAnime.url}
                        className="inline-flex items-center gap-1 hover:underline hover:underline-offset-4"
                        target="_blank"
                      >
                        Visit MAL
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                    <div className="grid grid-cols-1 xl:grid-cols-3 col-span-1 xl:col-span-3 gap-4">
                      {chosenAnime.genres.length > 0 && (
                        <div className="flex flex-col gap-1">
                          <Label>Genres</Label>
                          <div className="flex flex-wrap gap-2 items-center">
                            {chosenAnime.genres.map((genre) => {
                              return (
                                <Badge key={genre.mal_id}>{genre.name}</Badge>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      {chosenAnime.themes.length > 0 && (
                        <div className="flex flex-col gap-1">
                          <Label>Themes</Label>
                          <div className="flex flex-wrap gap-2 items-center">
                            {chosenAnime.themes.map((theme) => {
                              return (
                                <Badge key={theme.mal_id}>{theme.name}</Badge>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      {chosenAnime.studios.length > 0 && (
                        <div className="flex flex-col gap-1">
                          <Label>Studios</Label>
                          <div className="flex flex-wrap gap-2 items-center">
                            {chosenAnime.studios.map((studio) => {
                              return (
                                <Badge key={studio.mal_id}>{studio.name}</Badge>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-1 col-span-1 xl:col-span-3">
                      <Label>Synopsis</Label>
                      <Textarea
                        rows={7}
                        value={chosenAnime.synopsis}
                        readOnly
                        className="resize-none"
                      />
                    </div>
                    {embedURL && (
                      <div className="flex flex-col gap-1">
                        <Label>Trailer</Label>
                        <iframe
                          src={embedURL}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          title="Anime Trailer"
                          className="w-fit xl:w-[500px] h-[200px] xl:h-[300px]"
                        ></iframe>
                      </div>
                    )}
                  </div>
                </div>
              </ScrollArea>
            </div>
            <Button onClick={() => addAnime(chosenAnime)}>
              {isLoadingAddAnime && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Add Anime
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
