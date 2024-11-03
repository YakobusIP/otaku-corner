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
import { Anime } from "@tutkli/jikan-ts";
import SearchAnimeJikan from "@/components/admin/add-anime/SearchAnimeJikan";
import { addAnimeService } from "@/services/anime.service";
import AnimeSmallCard from "@/components/admin/add-anime/AnimeSmallCard";

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
  const [selectedAnime, setSelectedAnime] = useState<Anime[]>([]);
  const [isLoadingAddAnime, setIsLoadingAddAnime] = useState(false);

  const toast = useToast();

  const addAnime = async () => {
    setIsLoadingAddAnime(true);
    const data = selectedAnime.map((anime) => ({
      malId: anime.mal_id,
      type: anime.type,
      status: anime.status,
      rating: anime.rating ?? "Unrated",
      season: anime.season
        ? `${anime.season.toUpperCase()} ${anime.year}`
        : null,
      title: anime.title,
      titleJapanese: anime.title_japanese,
      titleSynonyms: anime.title_synonyms
        .map((synonym) => synonym.toLowerCase())
        .join(" "),
      source: anime.source,
      aired:
        anime.type === "TV"
          ? anime.status === "Not yet aired"
            ? anime.status
            : `${new Date(anime.aired.from).toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
                year: "numeric"
              })} to ${
                anime.aired.to
                  ? new Date(anime.aired.to).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric"
                    })
                  : "?"
              }`
          : `${new Date(anime.aired.from).toLocaleDateString("en-US", {
              day: "numeric",
              month: "short",
              year: "numeric"
            })}`,
      broadcast: anime.broadcast.string ?? "N/A",
      episodesCount: anime.episodes,
      duration: anime.duration,
      score: anime.score,
      images: {
        image_url: anime.images.webp
          ? anime.images.webp.image_url
          : anime.images.jpg.image_url,
        large_image_url: anime.images.webp
          ? anime.images.webp.large_image_url
          : anime.images.jpg.large_image_url,
        small_image_url: anime.images.webp
          ? anime.images.webp.small_image_url
          : anime.images.jpg.small_image_url
      },
      genres: anime.genres.map((genre) => genre.name),
      studios: anime.studios.map((studio) => studio.name),
      themes: anime.themes.map((theme) => theme.name),
      synopsis: anime.synopsis ? anime.synopsis : "No synopsis available",
      trailer: anime?.trailer.embed_url?.replace(
        /(autoplay=)[^&]+/,
        "autoplay=0"
      ),
      malUrl: anime.url
    }));

    const response = await addAnimeService(data);
    if (response.success) {
      toast.toast({
        title: "All set!",
        description: response.data.message
      });

      setSelectedAnime([]);
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
          <PlusIcon className="mr-2 w-4 h-4" />
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
            selectedAnime={selectedAnime}
            setSelectedAnime={setSelectedAnime}
          />
        </div>
        <div className="flex flex-wrap w-full gap-4 items-center">
          {selectedAnime.map((anime) => {
            return (
              <AnimeSmallCard
                anime={anime}
                setSelectedAnime={setSelectedAnime}
              />
            );
          })}
        </div>
        {selectedAnime.length > 0 && (
          <Button onClick={() => addAnime()}>
            {isLoadingAddAnime && (
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            )}
            Add Anime(s)
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
