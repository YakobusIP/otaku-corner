// Components import
import { Dispatch, SetStateAction, useState } from "react";

import { lightNovelService } from "@/services/light-novel.service";

import LightNovelSmallCard from "@/components/add-lightnovel/LightNovelSmallCard";
import SearchLightNovelJikan from "@/components/add-lightnovel/SearchLightNovelJikan";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

import { useToast } from "@/hooks/useToast";

import type { LightNovelCreateRequest } from "@/types/light-novel.type";

import { mediaKeys } from "@/lib/query-keys";
import { generateSlug } from "@/lib/utils";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Manga } from "@tutkli/jikan-ts";
import { Loader2Icon } from "lucide-react";

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
  const queryClient = useQueryClient();

  const [selectedLightNovel, setSelectedLightNovel] = useState<Manga[]>([]);

  const addLightNovelMutation = useMutation({
    mutationFn: async (data: LightNovelCreateRequest[]) => {
      const response = await lightNovelService.create(data);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    onSuccess: async (addedIds) => {
      await queryClient.invalidateQueries({ queryKey: mediaKeys.all });
      await queryClient.invalidateQueries({
        queryKey: mediaKeys.statusCounts("lightNovel")
      });
      await resetParent();

      toast.toast({
        title: "All set!",
        description:
          addedIds.length === 1
            ? "Light novel added successfully"
            : `${addedIds.length} light novels added successfully`
      });

      setSelectedLightNovel([]);
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

  const buildLightNovelPayload = () => {
    const slugCounts: Record<string, number> = {};

    return selectedLightNovel.map((lightNovel) => {
      let slug = generateSlug(lightNovel.title);

      if (slugCounts[slug]) {
        slugCounts[slug] += 1;
        slug = `${slug}-${slugCounts[slug]}`;
      } else {
        slugCounts[slug] = 1;
      }

      return {
        id: lightNovel.mal_id,
        slug,
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
            : `${new Date(lightNovel.published.from).toLocaleDateString(
                "en-US",
                {
                  day: "numeric",
                  month: "short",
                  year: "numeric"
                }
              )} to ${
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
      };
    });
  };

  const addLightNovel = async () => {
    const data = buildLightNovelPayload();
    addLightNovelMutation.mutate(data);
  };

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
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
          <Button
            onClick={addLightNovel}
            disabled={addLightNovelMutation.isPending}
          >
            {addLightNovelMutation.isPending && (
              <Loader2Icon className="w-4 h-4 animate-spin" />
            )}
            Add Light Novel(s)
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
