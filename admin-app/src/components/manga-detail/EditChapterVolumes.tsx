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

import { MangaDetail } from "@/types/manga.type";

import { Loader2Icon, PencilIcon } from "lucide-react";

type Props = {
  mangaDetail: MangaDetail;
  resetParent: () => Promise<void>;
};

export default function EditChapterVolumes({
  mangaDetail,
  resetParent
}: Props) {
  const toast = useToast();
  const [chaptersCount, setChaptersCount] = useState(
    mangaDetail.chaptersCount ?? 0
  );
  const [volumesCount, setVolumesCount] = useState(
    mangaDetail.volumesCount ?? 0
  );
  const [isLoadingUpdateMangaStats, setIsLoadingUpdateMangaStats] =
    useState(false);

  const updateMangaStats = async () => {
    setIsLoadingUpdateMangaStats(true);
    const response = await updateMangaVolumeAndChaptersService(
      mangaDetail.id,
      chaptersCount,
      volumesCount
    );

    if (response.success) {
      resetParent();
      toast.toast({
        title: "All set!",
        description: response.data.message
      });
    } else {
      toast.toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: response.error
      });
    }

    setIsLoadingUpdateMangaStats(false);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <PencilIcon className="w-4 h-4 mr-2" />
          Override Chapter and Volumes
        </Button>
      </DialogTrigger>
      <DialogContent className="w-1/5">
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
          <Button type="submit" onClick={updateMangaStats}>
            {isLoadingUpdateMangaStats && (
              <Loader2Icon className="w-4 h-4 animate-spin mr-2" />
            )}
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
