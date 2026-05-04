import { Dispatch, SetStateAction, useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

import { useToast } from "@/hooks/useToast";

import { MessageResponse } from "@/types/api.type";

import { PROGRESS_STATUS } from "@/lib/enums";
import { mediaKeys } from "@/lib/query-keys";
import { cn } from "@/lib/utils";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircleIcon,
  EyeIcon,
  PauseCircleIcon,
  PlayCircleIcon,
  XCircleIcon
} from "lucide-react";
import { useDebouncedCallback } from "use-debounce";

type Props = {
  id: number;
  progressStatus: string;
  setProgressStatus?: Dispatch<SetStateAction<string>>;
  serviceFn?: (
    id: number,
    progressStatus: PROGRESS_STATUS
  ) => Promise<
    { success: true; data: MessageResponse } | { success: false; error: string }
  >;
  triggerClassName?: string;
};

export default function ProgressStatus({
  id,
  progressStatus,
  setProgressStatus,
  serviceFn,
  triggerClassName
}: Props) {
  const [selectedStatus, setSelectedStatus] = useState(progressStatus);
  const toast = useToast();
  const queryClient = useQueryClient();

  const statusOptions = [
    {
      value: "PLANNED",
      label: PROGRESS_STATUS.PLANNED,
      Icon: EyeIcon,
      iconClass: "text-slate-300",
      triggerClass:
        "bg-linear-to-r from-slate-600 to-slate-700 text-white border-slate-500/40 shadow-xs [&_svg]:text-white"
    },
    {
      value: "ON_HOLD",
      label: PROGRESS_STATUS.ON_HOLD,
      Icon: PauseCircleIcon,
      iconClass: "text-amber-400",
      triggerClass:
        "bg-linear-to-r from-amber-600 to-orange-600 text-white border-amber-500/30 shadow-xs [&_svg]:text-white"
    },
    {
      value: "ON_PROGRESS",
      label: PROGRESS_STATUS.ON_PROGRESS,
      Icon: PlayCircleIcon,
      iconClass: "text-sky-400",
      triggerClass:
        "bg-linear-to-r from-blue-600 to-indigo-600 text-white border-blue-500/40 shadow-xs [&_svg]:text-white"
    },
    {
      value: "COMPLETED",
      label: PROGRESS_STATUS.COMPLETED,
      Icon: CheckCircleIcon,
      iconClass: "text-violet-400",
      triggerClass:
        "bg-linear-to-r from-violet-600 to-purple-600 text-white border-violet-500/30 shadow-xs [&_svg]:text-white"
    },
    {
      value: "DROPPED",
      label: PROGRESS_STATUS.DROPPED,
      Icon: XCircleIcon,
      iconClass: "text-rose-400",
      triggerClass:
        "bg-linear-to-r from-rose-600 to-red-600 text-white border-rose-500/30 shadow-xs [&_svg]:text-white"
    }
  ];

  const selectedTriggerClass =
    statusOptions.find((option) => option.value === selectedStatus)
      ?.triggerClass ?? "bg-linear-to-r from-slate-600 to-slate-700 text-white";

  const updateProgressStatusMutation = useMutation({
    mutationFn: async (nextStatus: PROGRESS_STATUS) => {
      if (!serviceFn) return undefined;
      const response = await serviceFn(id, nextStatus);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: mediaKeys.all });
      await queryClient.invalidateQueries({
        queryKey: mediaKeys.statusCounts("anime")
      });
      await queryClient.invalidateQueries({
        queryKey: mediaKeys.statusCounts("manga")
      });
      await queryClient.invalidateQueries({
        queryKey: mediaKeys.statusCounts("lightNovel")
      });
      toast.toast({
        title: "All set!",
        description: data?.message ?? "Progress status updated successfully"
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

  const debouncedSubmit = useDebouncedCallback(
    (nextStatus: PROGRESS_STATUS) => {
      updateProgressStatusMutation.mutate(nextStatus);
    },
    1000
  );

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);

    if (setProgressStatus) {
      setProgressStatus(value);
    } else if (serviceFn) {
      debouncedSubmit(value as PROGRESS_STATUS);
    }
  };

  return (
    <Select
      defaultValue={PROGRESS_STATUS.PLANNED}
      value={selectedStatus}
      onValueChange={handleStatusChange}
    >
      <SelectTrigger
        className={cn(
          "w-[180px] border font-medium ring-offset-background [&_svg]:text-white",
          selectedTriggerClass,
          triggerClassName
        )}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {statusOptions.map((option) => {
          const ItemIcon = option.Icon;
          return (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center">
                <ItemIcon
                  className={cn("mr-2 h-4 w-4 shrink-0", option.iconClass)}
                />
                {option.label}
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
