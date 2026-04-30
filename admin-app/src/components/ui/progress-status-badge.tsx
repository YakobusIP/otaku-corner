import * as React from "react";

import { PROGRESS_STATUS, type ProgressStatusKey } from "@/lib/enums";
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
  progressStatus: ProgressStatusKey;
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
      icon: <EyeIcon className="mr-2 h-4 w-4 shrink-0" />,
      gradient:
        "bg-gradient-to-r from-slate-600 to-slate-700 text-white border-slate-500/40 shadow-sm"
    },
    {
      value: "ON_HOLD",
      label: PROGRESS_STATUS.ON_HOLD,
      icon: <PauseCircleIcon className="mr-2 h-4 w-4 shrink-0" />,
      gradient:
        "bg-gradient-to-r from-amber-600 to-orange-600 text-white border-amber-500/30 shadow-sm"
    },
    {
      value: "ON_PROGRESS",
      label: PROGRESS_STATUS.ON_PROGRESS,
      icon: <PlayCircleIcon className="mr-2 h-4 w-4 shrink-0" />,
      gradient:
        "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-500/40 shadow-sm"
    },
    {
      value: "COMPLETED",
      label: PROGRESS_STATUS.COMPLETED,
      icon: <CheckCircleIcon className="mr-2 h-4 w-4 shrink-0" />,
      gradient:
        "bg-gradient-to-r from-violet-600 to-purple-600 text-white border-violet-500/30 shadow-sm"
    },
    {
      value: "DROPPED",
      label: PROGRESS_STATUS.DROPPED,
      icon: <XCircleIcon className="mr-2 h-4 w-4 shrink-0" />,
      gradient:
        "bg-gradient-to-r from-rose-600 to-red-600 text-white border-rose-500/30 shadow-sm"
    }
  ];

  const selectedStatus = statusOptions.find(
    (option) => option.value === progressStatus
  );

  if (!selectedStatus) return null;

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold text-white transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 [&_svg]:text-white",
        selectedStatus.gradient,
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
