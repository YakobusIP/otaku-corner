import { useState } from "react";

import { updateLightNovelVolumeProgressService } from "@/services/lightnovel.service";

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
import MonthPicker from "@/components/ui/month-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";

import { useToast } from "@/hooks/useToast";

import { LightNovelDetail } from "@/types/lightnovel.type";

import { cn, createUTCDate } from "@/lib/utils";

import { CalendarDaysIcon, Loader2Icon } from "lucide-react";

type Props = {
  lightNovelDetail: LightNovelDetail;
  resetParent: () => Promise<void>;
};

export default function VolumeProgressModal({
  lightNovelDetail,
  resetParent
}: Props) {
  const toast = useToast();
  const [volumeProgress, setVolumeProgress] = useState(
    lightNovelDetail.volumeProgress
  );
  const [isLoadingUpdate, setIsLoadingUpdate] = useState(false);

  const onMonthChange = (value: Date, id: string) => {
    const adjustedConsumedMonth = value
      ? createUTCDate(value.getUTCFullYear(), value.getUTCMonth())
      : null;

    setVolumeProgress((prevProgress) =>
      prevProgress.map((volume) =>
        volume.id === id
          ? { ...volume, consumedAt: adjustedConsumedMonth }
          : volume
      )
    );
  };

  const updateLightNovelVolumeProgress = async () => {
    setIsLoadingUpdate(true);
    const response =
      await updateLightNovelVolumeProgressService(volumeProgress);

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
  };

  return (
    <Dialog>
      <DialogTrigger className="self-end pb-2">
        <CalendarDaysIcon
          className={
            volumeProgress.some((volume) => !volume.consumedAt)
              ? "text-red-600"
              : "text-green-700"
          }
        />
      </DialogTrigger>
      <DialogContent className="w-full xl:w-1/5">
        <DialogHeader>
          <DialogTitle>{lightNovelDetail.title} Volume Progress</DialogTitle>
          <DialogDescription>
            Edit <strong>{lightNovelDetail.title}</strong> volumes progress.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {volumeProgress.map((volume) => {
            return (
              <Popover key={volume.id}>
                <PopoverTrigger>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          className={cn(
                            "w-10 h-10 xl:w-12 xl:h-12",
                            volume.consumedAt ? "bg-green-700" : "bg-red-600"
                          )}
                        >
                          {volume.volumeNumber}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {volume.consumedAt ? (
                          <p>
                            Consumed at{" "}
                            {new Date(volume.consumedAt).toLocaleString(
                              "default",
                              {
                                month: "long"
                              }
                            )}{" "}
                            {new Date(volume.consumedAt).getUTCFullYear()}
                          </p>
                        ) : (
                          <p>Consumed date is not set</p>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </PopoverTrigger>
                <PopoverContent className="w-fit">
                  <p className="text-center font-bold">Month consumed</p>
                  <MonthPicker
                    currentMonth={
                      volume.consumedAt ||
                      createUTCDate(
                        new Date().getUTCFullYear(),
                        new Date().getUTCMonth()
                      )
                    }
                    onMonthChange={(value) => onMonthChange(value, volume.id)}
                  />
                </PopoverContent>
              </Popover>
            );
          })}
        </div>
        <DialogFooter>
          <Button type="submit" onClick={updateLightNovelVolumeProgress}>
            {isLoadingUpdate && (
              <Loader2Icon className="w-4 h-4 animate-spin mr-2" />
            )}
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
