import { Dispatch, SetStateAction, useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

import { useToast } from "@/hooks/useToast";
import { mediaKeys } from "@/lib/query-keys";

import { MessageResponse } from "@/types/api.type";

import { PROGRESS_STATUS } from "@/lib/enums";
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
    | { success: true; data: MessageResponse }
    | { success: false; error: string }
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
      icon: <EyeIcon className="mr-2 h-4 w-4" />,
      color: "bg-sky-400"
    },
    {
      value: "ON_HOLD",
      label: PROGRESS_STATUS.ON_HOLD,
      icon: <PauseCircleIcon className="mr-2 h-4 w-4" />,
      color: "bg-yellow-400"
    },
    {
      value: "ON_PROGRESS",
      label: PROGRESS_STATUS.ON_PROGRESS,
      icon: <PlayCircleIcon className="mr-2 h-4 w-4" />,
      color: "bg-green-300"
    },
    {
      value: "COMPLETED",
      label: PROGRESS_STATUS.COMPLETED,
      icon: <CheckCircleIcon className="mr-2 h-4 w-4" />,
      color: "bg-purple-300"
    },
    {
      value: "DROPPED",
      label: PROGRESS_STATUS.DROPPED,
      icon: <XCircleIcon className="mr-2 h-4 w-4" />,
      color: "bg-destructive"
    }
  ];

  const selectedStatusColor =
    statusOptions.find((option) => option.value === selectedStatus)?.color ||
    "bg-white";

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

  const debouncedSubmit = useDebouncedCallback((nextStatus: PROGRESS_STATUS) => {
    updateProgressStatusMutation.mutate(nextStatus);
  }, 1000);

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
        className={cn("w-[180px]", selectedStatusColor, triggerClassName)}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {statusOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <div className="flex items-center">
              {option.icon}
              {option.label}
              <span
                className={cn(
                  "aspect-square w-4 ml-2 rounded-full",
                  option.color
                )}
              />
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
