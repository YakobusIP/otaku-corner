// Components import
import { Dispatch, SetStateAction, useState } from "react";

import { addAnimeService } from "@/services/anime.service";

import AnimeSmallCard from "@/components/add-anime/AnimeSmallCard";
import SearchAnimeJikan from "@/components/add-anime/SearchAnimeJikan";
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

import { mediaKeys } from "@/lib/query-keys";
import { generateSlug } from "@/lib/utils";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Anime } from "@tutkli/jikan-ts";
import { FilmIcon, Loader2Icon } from "lucide-react";

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
  const toast = useToast();
  const isWideScreen = useWideScreen();
  const queryClient = useQueryClient();

  const [selectedAnime, setSelectedAnime] = useState<Anime[]>([]);

  const addAnimeMutation = useMutation({
    mutationFn: async (data: Parameters<typeof addAnimeService>[0]) => {
      const response = await addAnimeService(data);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    onSuccess: async (addedIds) => {
      await queryClient.invalidateQueries({ queryKey: mediaKeys.all });
      await queryClient.invalidateQueries({
        queryKey: mediaKeys.statusCounts("anime")
      });
      await resetParent();

      toast.toast({
        title: "All set!",
        description:
          addedIds.length === 1
            ? "Anime added successfully"
            : `${addedIds.length} anime added successfully`
      });

      setSelectedAnime([]);
      setOpenDialog(false);
    },
    onError: (error: Error) => {
      toast.toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: error.message
      });
    }
  });

  const buildAnimePayload = () => {
    const slugCounts: Record<string, number> = {};

    return selectedAnime.map((anime) => {
      let slug = generateSlug(anime.title);

      if (slugCounts[slug]) {
        slugCounts[slug] += 1;
        slug = `${slug}-${slugCounts[slug]}`;
      } else {
        slugCounts[slug] = 1;
      }

      return {
        id: anime.mal_id,
        slug,
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
      };
    });
  };

  const addAnime = async () => {
    const data = buildAnimePayload();
    addAnimeMutation.mutate(data);
  };

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger asChild>
        <Button
          className="w-full xl:w-fit"
          variant={isWideScreen ? "default" : "outline"}
        >
          <FilmIcon className="w-4 h-4" />
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
        <ScrollArea className="max-h-96">
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
        </ScrollArea>
        {selectedAnime.length > 0 && (
          <Button
            onClick={() => addAnime()}
            disabled={addAnimeMutation.isPending}
          >
            {addAnimeMutation.isPending && (
              <Loader2Icon className="w-4 h-4 animate-spin" />
            )}
            Add Anime(s)
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
