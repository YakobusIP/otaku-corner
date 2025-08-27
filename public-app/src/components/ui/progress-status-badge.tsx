import * as React from "react";

import { PROGRESS_STATUS } from "@/lib/enums";
import { cn } from "@/lib/utils";

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
      color: "bg-purple-600 hover:bg-purple-600/80"
    },
    {
      value: "ON_HOLD",
      label: PROGRESS_STATUS.ON_HOLD,
      color: "bg-yellow-600 hover:bg-yellow-600/80"
    },
    {
      value: "ON_PROGRESS",
      label: PROGRESS_STATUS.ON_PROGRESS,
      color: "bg-blue-600 hover:bg-blue-600/80"
    },
    {
      value: "COMPLETED",
      label: PROGRESS_STATUS.COMPLETED,
      color: "bg-green-600 hover:bg-green-600/80"
    },
    {
      value: "DROPPED",
      label: PROGRESS_STATUS.DROPPED,
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
      {selectedStatus.label}
    </div>
  );
}

export { ProgressStatusBadge };
