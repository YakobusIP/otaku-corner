import * as React from "react";

import { PROGRESS_STATUS, type ProgressStatusKey } from "@/lib/shared/enums";
import { cn } from "@/lib/shared/utils";

import {
  CheckCircleIcon,
  EyeIcon,
  LucideIcon,
  PauseCircleIcon,
  PlayCircleIcon,
  XCircleIcon
} from "lucide-react";

type ProgressStatusInput =
  | ProgressStatusKey
  | PROGRESS_STATUS
  | string
  | null
  | undefined;

type ProgressStatusOption = {
  value: string;
  label: string;
  Icon: LucideIcon;
  pillClassName: string;
  badgeClassName: string;
};

const progressStatusOptions: ProgressStatusOption[] = [
  {
    value: "PLANNED",
    label: PROGRESS_STATUS.PLANNED,
    Icon: EyeIcon,
    pillClassName: "bg-linear-to-r from-slate-600 to-slate-700",
    badgeClassName:
      "bg-linear-to-r from-slate-600 to-slate-700 border-slate-500/40 shadow-xs"
  },
  {
    value: "ON_HOLD",
    label: PROGRESS_STATUS.ON_HOLD,
    Icon: PauseCircleIcon,
    pillClassName: "bg-linear-to-r from-amber-600 to-orange-600",
    badgeClassName:
      "bg-linear-to-r from-amber-600 to-orange-600 border-amber-500/30 shadow-xs"
  },
  {
    value: "ON_PROGRESS",
    label: PROGRESS_STATUS.ON_PROGRESS,
    Icon: PlayCircleIcon,
    pillClassName: "bg-linear-to-r from-blue-600 to-indigo-600",
    badgeClassName:
      "bg-linear-to-r from-blue-600 to-indigo-600 border-blue-500/40 shadow-xs"
  },
  {
    value: "COMPLETED",
    label: PROGRESS_STATUS.COMPLETED,
    Icon: CheckCircleIcon,
    pillClassName: "bg-linear-to-r from-violet-600 to-purple-600",
    badgeClassName:
      "bg-linear-to-r from-violet-600 to-purple-600 border-violet-500/30 shadow-xs"
  },
  {
    value: "DROPPED",
    label: PROGRESS_STATUS.DROPPED,
    Icon: XCircleIcon,
    pillClassName: "bg-linear-to-r from-rose-600 to-red-600",
    badgeClassName:
      "bg-linear-to-r from-rose-600 to-red-600 border-rose-500/30 shadow-xs"
  }
];

const resolveProgressStatusOption = (
  progressStatus: ProgressStatusInput
): ProgressStatusOption | undefined =>
  progressStatusOptions.find(
    (option) =>
      option.value === progressStatus || option.label === progressStatus
  );

interface ProgressStatusBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  progressStatus: ProgressStatusInput;
}

function ProgressStatusBadge({
  className,
  progressStatus,
  ...props
}: ProgressStatusBadgeProps) {
  const selectedStatus = resolveProgressStatusOption(progressStatus);

  if (!selectedStatus) return null;

  const StatusIcon = selectedStatus.Icon;

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold text-white transition-all hover:shadow-md focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2",
        selectedStatus.badgeClassName,
        className
      )}
      {...props}
    >
      <StatusIcon className="mr-2 h-4 w-4 shrink-0 text-white" />
      {selectedStatus.label}
    </div>
  );
}

interface ProgressStatusPillProps extends React.HTMLAttributes<HTMLDivElement> {
  progressStatus: ProgressStatusInput;
}

/** Same shell as score overlays on anime cards (mobile). */
function ProgressStatusPill({
  className,
  progressStatus,
  ...props
}: ProgressStatusPillProps) {
  const selectedStatus = resolveProgressStatusOption(progressStatus);

  if (!selectedStatus) return null;

  const StatusIcon = selectedStatus.Icon;

  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-full px-2 py-1 backdrop-blur-sm",
        selectedStatus.pillClassName,
        className
      )}
      {...props}
    >
      <StatusIcon size={12} className="shrink-0 text-white" />
      <span className="text-xs font-medium leading-none text-white">
        {selectedStatus.label}
      </span>
    </div>
  );
}

export { ProgressStatusBadge, ProgressStatusPill };
