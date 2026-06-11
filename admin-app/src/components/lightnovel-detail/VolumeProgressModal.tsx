import { useEffect, useState } from "react";

import { lightNovelService } from "@/services/light-novel.service";

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

import { LightNovelDetail } from "@/types/light-novel.type";

import { detailKeys } from "@/lib/query-keys";
import { cn, createUTCDate } from "@/lib/utils";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarDaysIcon, Loader2Icon } from "lucide-react";
import { toast } from "sonner";

type Props = {
  lightNovelDetail: LightNovelDetail;
  resetParent: () => Promise<void>;
};

export default function VolumeProgressModal({
  lightNovelDetail,
  resetParent
}: Props) {
  const queryClient = useQueryClient();
  const [volumeProgress, setVolumeProgress] = useState(
    lightNovelDetail.volumeProgress
  );

  useEffect(() => {
    setVolumeProgress(lightNovelDetail.volumeProgress);
  }, [lightNovelDetail.id, lightNovelDetail.volumeProgress]);

  const updateVolumeProgressMutation = useMutation({
    mutationFn: async (
      nextVolumeProgress: { id: number; consumedAt?: Date | null }[]
    ) => {
      const response =
        await lightNovelService.updateVolumeProgress(nextVolumeProgress);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: detailKeys.lightNovel(lightNovelDetail.id)
      });
      await resetParent();
      toast.success("All set!", {
        description: data?.message ?? "Volume progress updated successfully"
      });
    },
    onError: (error: Error) => {
      toast.error("Uh oh! Something went wrong", {
        description: error.message
      });
    }
  });

  const onMonthChange = (value: Date, id: number) => {
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

  const updateLightNovelVolumeProgress = () => {
    updateVolumeProgressMutation.mutate(volumeProgress);
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
      <DialogContent className="w-full md:w-2/5 2xl:w-1/5">
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
          <Button
            type="submit"
            onClick={updateLightNovelVolumeProgress}
            disabled={updateVolumeProgressMutation.isPending}
          >
            {updateVolumeProgressMutation.isPending && (
              <Loader2Icon className="w-4 h-4 animate-spin mr-2" />
            )}
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
