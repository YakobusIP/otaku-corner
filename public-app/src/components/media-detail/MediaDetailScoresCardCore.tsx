import { type ReactNode } from "react";

import { ProgressStatusBadge } from "@/components/ui/progress-status-badge";

import { PROGRESS_STATUS, type ProgressStatusKey } from "@/lib/shared/enums";
import { formatMalScoreWithMax } from "@/lib/shared/utils";

import { HeartIcon, StarIcon } from "lucide-react";

type MediaDetailScoresCardCoreProps = {
  malScore: number | null | undefined;
  personalScore: number | null | undefined;
  progressStatusLabel: string;
  review: {
    progressStatus: ProgressStatusKey | PROGRESS_STATUS;
  } | null | undefined;
  footer: ReactNode;
};

export default function MediaDetailScoresCardCore({
  malScore,
  personalScore,
  progressStatusLabel,
  review,
  footer
}: MediaDetailScoresCardCoreProps) {
  return (
    <div className="rounded-2xl border border-white/50 bg-white/45 p-4 shadow-md shadow-rose-100/30 backdrop-blur-md lg:p-5">
      <div className="grid grid-cols-2 gap-4 sm:max-lg:grid-cols-3 lg:grid-cols-3">
        <div className="space-y-1 border-slate-200/80 border-r pr-4">
          <p className="text-sm text-slate-500">MAL Score</p>
          <p className="flex items-center gap-1.5 text-2xl font-bold text-slate-900">
            <StarIcon
              className="size-[1em] shrink-0 fill-amber-400 text-amber-400"
              aria-hidden
            />
            {formatMalScoreWithMax(malScore)}
          </p>
        </div>

        <div className="space-y-1 border-slate-200/80 sm:max-lg:border-r sm:max-lg:px-4 lg:border-r lg:px-4">
          <p className="text-sm text-slate-500">My Score</p>
          <p className="flex items-center gap-1.5 text-2xl font-bold text-slate-900">
            <HeartIcon
              className="size-[1em] shrink-0 fill-[#ff6b8b] text-[#ff6b8b]"
              aria-hidden
            />
            {formatMalScoreWithMax(personalScore)}
          </p>
        </div>

        <div className="col-span-2 space-y-2 sm:max-lg:col-span-1 sm:max-lg:pl-1 lg:col-span-1 lg:pl-1">
          <p className="text-sm text-slate-500">{progressStatusLabel}</p>
          {review ? (
            <ProgressStatusBadge
              progressStatus={review.progressStatus}
              className="rounded-md px-3 py-1.5 text-sm"
            />
          ) : (
            <p className="text-sm text-slate-500">No personal entry</p>
          )}
        </div>
      </div>

      {footer}
    </div>
  );
}
