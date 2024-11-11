import { useState } from "react";

import { updateLightNovelVolumesService } from "@/services/lightnovel.service";

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

import { LightNovelDetail } from "@/types/lightnovel.type";

import { Loader2Icon, PencilIcon } from "lucide-react";

type Props = {
  lightNovelDetail: LightNovelDetail;
  resetParent: () => Promise<void>;
};

export default function EditVolumes({ lightNovelDetail, resetParent }: Props) {
  const toast = useToast();
  const [volumesCount, setVolumesCount] = useState(
    lightNovelDetail.volumesCount ?? 0
  );
  const [isLoadingUpdateLightNovelStats, setIsLoadingUpdateLightNovelStats] =
    useState(false);

  const updateLightNovelStats = async () => {
    setIsLoadingUpdateLightNovelStats(true);
    const response = await updateLightNovelVolumesService(
      lightNovelDetail.id,
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

    setIsLoadingUpdateLightNovelStats(false);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <PencilIcon className="w-4 h-4 mr-2" />
          Override Volumes
        </Button>
      </DialogTrigger>
      <DialogContent className="w-1/5">
        <DialogHeader>
          <DialogTitle>Override Volumes</DialogTitle>
          <DialogDescription>
            Edit <strong>{lightNovelDetail.title}</strong> volumes count.
          </DialogDescription>
        </DialogHeader>
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
          <Button type="submit" onClick={updateLightNovelStats}>
            {isLoadingUpdateLightNovelStats && (
              <Loader2Icon className="w-4 h-4 animate-spin mr-2" />
            )}
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
