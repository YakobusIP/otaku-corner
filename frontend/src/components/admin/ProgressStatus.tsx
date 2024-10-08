import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { PROGRESS_STATUS } from "@/lib/enums";
import { cn } from "@/lib/utils";

import { Dispatch, SetStateAction, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useDebouncedCallback } from "use-debounce";
import { ApiResponse, MessageResponse } from "@/types/api.type";
import {
  CheckCircle,
  Eye,
  PauseCircle,
  PlayCircle,
  XCircle
} from "lucide-react";

type Props = {
  id: string;
  progressStatus: string;
  setProgressStatus?: Dispatch<SetStateAction<string>>;
  serviceFn?: (
    id: string,
    progressStatus: PROGRESS_STATUS
  ) => Promise<ApiResponse<MessageResponse>>;
};

export default function ProgressStatus({
  id,
  progressStatus,
  setProgressStatus,
  serviceFn
}: Props) {
  const [selectedStatus, setSelectedStatus] = useState(progressStatus);
  const toast = useToast();

  const statusOptions = [
    {
      value: "PLANNED",
      label: PROGRESS_STATUS.PLANNED,
      icon: <Eye className="mr-2 h-4 w-4" />,
      color: "bg-sky-400"
    },
    {
      value: "ON_HOLD",
      label: PROGRESS_STATUS.ON_HOLD,
      icon: <PauseCircle className="mr-2 h-4 w-4" />,
      color: "bg-yellow-300"
    },
    {
      value: "ON_PROGRESS",
      label: PROGRESS_STATUS.ON_PROGRESS,
      icon: <PlayCircle className="mr-2 h-4 w-4" />,
      color: "bg-green-300"
    },
    {
      value: "COMPLETED",
      label: PROGRESS_STATUS.COMPLETED,
      icon: <CheckCircle className="mr-2 h-4 w-4" />,
      color: "bg-purple-300"
    },
    {
      value: "DROPPED",
      label: PROGRESS_STATUS.DROPPED,
      icon: <XCircle className="mr-2 h-4 w-4" />,
      color: "bg-destructive"
    }
  ];

  const selectedStatusColor =
    statusOptions.find((option) => option.value === selectedStatus)?.color ||
    "bg-white";

  const debouncedSubmit = useDebouncedCallback(async () => {
    if (serviceFn) {
      const response = await serviceFn(id, selectedStatus as PROGRESS_STATUS);

      if (response.success) {
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
    }
  }, 1000);

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);

    if (setProgressStatus) {
      setProgressStatus(value);
    } else {
      debouncedSubmit();
    }
  };

  return (
    <Select
      defaultValue={PROGRESS_STATUS.PLANNED}
      value={selectedStatus}
      onValueChange={handleStatusChange}
    >
      <SelectTrigger className={cn("w-[180px]", selectedStatusColor)}>
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
