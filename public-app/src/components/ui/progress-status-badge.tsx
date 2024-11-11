import * as React from "react";

import { PROGRESS_STATUS } from "@/lib/enums";
import { cn } from "@/lib/utils";

import {
  CheckCircleIcon,
  EyeIcon,
  PauseCircleIcon,
  PlayCircleIcon,
  XCircleIcon
} from "lucide-react";

interface ProgressStatusBadgeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  progressStatus: PROGRESS_STATUS;
}

function ProgressStatusBadge({
  className,
  progressStatus,
  ...props
}: ProgressStatusBadgeProps) {
  const statusOptions = [
    {
      value: "PLANNED",
      label: PROGRESS_STATUS.PLANNED,
      icon: <EyeIcon className="mr-2 h-4 w-4" />,
      color: "bg-sky-400 hover:bg-sky-400/80"
    },
    {
      value: "ON_HOLD",
      label: PROGRESS_STATUS.ON_HOLD,
      icon: <PauseCircleIcon className="mr-2 h-4 w-4" />,
      color: "bg-yellow-300 hover:bg-yellow-300/80"
    },
    {
      value: "ON_PROGRESS",
      label: PROGRESS_STATUS.ON_PROGRESS,
      icon: <PlayCircleIcon className="mr-2 h-4 w-4" />,
      color: "bg-green-700 hover:bg-green-700/80"
    },
    {
      value: "COMPLETED",
      label: PROGRESS_STATUS.COMPLETED,
      icon: <CheckCircleIcon className="mr-2 h-4 w-4" />,
      color: "bg-purple-300 hover:bg-purple-300/80"
    },
    {
      value: "DROPPED",
      label: PROGRESS_STATUS.DROPPED,
      icon: <XCircleIcon className="mr-2 h-4 w-4" />,
      color: "bg-destructive hover:bg-destructive/80"
    }
  ];

  const selectedStatus = statusOptions.find(
    (option) => option.value === progressStatus
  );

  if (!selectedStatus) return null;

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        selectedStatus.color,
        className
      )}
      {...props}
    >
      {selectedStatus.icon}
      {selectedStatus.label}
    </div>
  );
}

export { ProgressStatusBadge };
