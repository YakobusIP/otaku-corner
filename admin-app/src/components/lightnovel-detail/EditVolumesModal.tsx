import { Fragment, useState } from "react";

import { updateLightNovelVolumesService } from "@/services/lightnovel.service";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
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

export default function EditVolumesModal({
  lightNovelDetail,
  resetParent
}: Props) {
  const toast = useToast();
  const [volumesCount, setVolumesCount] = useState(
    lightNovelDetail.volumesCount ?? 0
  );
  const [openAlertDialog, setOpenAlertDialog] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [isLoadingUpdate, setIsLoadingUpdate] = useState(false);

  const validateVolumeNumber = async () => {
    if (lightNovelDetail.volumesCount) {
      if (volumesCount > lightNovelDetail.volumesCount) {
        setOpenAlertDialog(true);
        setAlertMessage(
          "You are about to add 2 additional light novel volumes to the system. This will increase the total volume count."
        );
      } else if (volumesCount < lightNovelDetail.volumesCount) {
        setOpenAlertDialog(true);
        setAlertMessage(
          `You are about to remove volumes ${volumesCount + 1} to ${lightNovelDetail.volumesCount} from the system. All related data, including their consumed dates, will be permanently deleted.`
        );
      } else {
        await updateLightNovelStats();
      }
    }
  };

  const updateLightNovelStats = async () => {
    setIsLoadingUpdate(true);
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

    setIsLoadingUpdate(false);
    setOpenAlertDialog(false);
  };

  return (
    <Fragment>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="destructive">
            <PencilIcon className="w-4 h-4 mr-2" />
            Override Volumes
          </Button>
        </DialogTrigger>
        <DialogContent className="w-full xl:w-1/5">
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
            <Button type="submit" onClick={validateVolumeNumber}>
              {!openAlertDialog && isLoadingUpdate && (
                <Loader2Icon className="w-4 h-4 animate-spin mr-2" />
              )}
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={openAlertDialog} onOpenChange={setOpenAlertDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>{alertMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOpenAlertDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={updateLightNovelStats}>
              {openAlertDialog && isLoadingUpdate && (
                <Loader2Icon className="w-4 h-4 animate-spin mr-2" />
              )}
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Fragment>
  );
}
