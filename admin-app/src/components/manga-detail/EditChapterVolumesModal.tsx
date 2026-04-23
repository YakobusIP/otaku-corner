import { useState } from "react";

import { updateMangaVolumeAndChaptersService } from "@/services/manga.service";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useToast } from "@/hooks/useToast";
import { detailKeys } from "@/lib/query-keys";

import { MangaDetail } from "@/types/manga.type";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2Icon, PencilIcon } from "lucide-react";

type Props = {
  mangaDetail: MangaDetail;
  resetParent?: () => Promise<void>;
};

export default function EditChapterVolumesModal({
  mangaDetail,
  resetParent
}: Props) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [chaptersCount, setChaptersCount] = useState(
    mangaDetail.chaptersCount ?? 0
  );
  const [volumesCount, setVolumesCount] = useState(
    mangaDetail.volumesCount ?? 0
  );

  const updateMangaStatsMutation = useMutation({
    mutationFn: async (payload: { chaptersCount: number; volumesCount: number }) => {
      const response = await updateMangaVolumeAndChaptersService(
        mangaDetail.id,
        payload.chaptersCount,
        payload.volumesCount
      );
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: detailKeys.manga(mangaDetail.id)
      });
      await resetParent?.();
      toast.toast({
        title: "All set!",
        description: data?.message ?? "Chapters and volumes updated successfully"
      });
    },
    onError: (error: Error) => {
      toast.toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: error.message
      });
    }
  });

  const updateMangaStats = () => {
    updateMangaStatsMutation.mutate({ chaptersCount, volumesCount });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-border/60 bg-background/30 text-foreground hover:bg-background/50"
        >
          <PencilIcon className="h-4 w-4" />
          Override Chapter and Volumes
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full xl:w-1/5">
        <DialogHeader>
          <DialogTitle>Override Chapter and Volumes</DialogTitle>
          <DialogDescription>
            Edit <strong>{mangaDetail.title}</strong> chapter and volumes count.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Label htmlFor="chapters">Chapters</Label>
          <Input
            id="chapters"
            type="number"
            placeholder="Chapter count"
            value={chaptersCount}
            onChange={(e) => setChaptersCount(parseInt(e.target.value))}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="volumes">Volumes</Label>
          <Input
            id="volumes"
            type="number"
            placeholder="Volume count"
            value={volumesCount}
            onChange={(e) => setVolumesCount(parseInt(e.target.value))}
          />
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={updateMangaStats}
            disabled={updateMangaStatsMutation.isPending}
          >
            {updateMangaStatsMutation.isPending && (
              <Loader2Icon className="w-4 h-4 animate-spin mr-2" />
            )}
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
