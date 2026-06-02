import {
  formatMangaChaptersLabel,
  formatMangaVolumesLabel
} from "@/components/manga/manga-detail-helpers";
import { ProgressStatusBadge } from "@/components/ui/progress-status-badge";

import { MangaDetail } from "@/types/manga.type";

import { formatMalScoreWithMax } from "@/lib/utils";

import { BookOpenIcon, HeartIcon, LibraryIcon, StarIcon } from "lucide-react";

type MangaDetailScoresCardProps = {
  mangaDetail: MangaDetail;
};

export default function MangaDetailScoresCard({
  mangaDetail
}: MangaDetailScoresCardProps) {
  const reviewObject = mangaDetail.review;
  const chaptersLabel = formatMangaChaptersLabel(mangaDetail.chaptersCount);
  const volumesLabel = formatMangaVolumesLabel(mangaDetail.volumesCount);

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
            {formatMalScoreWithMax(mangaDetail.score)}
          </p>
        </div>

        <div className="space-y-1 border-slate-200/80 sm:max-lg:border-r sm:max-lg:px-4 lg:border-r lg:px-4">
          <p className="text-sm text-slate-500">My Score</p>
          <p className="flex items-center gap-1.5 text-2xl font-bold text-slate-900">
            <HeartIcon
              className="size-[1em] shrink-0 fill-[#ff6b8b] text-[#ff6b8b]"
              aria-hidden
            />
            {formatMalScoreWithMax(reviewObject?.personalScore)}
          </p>
        </div>

        <div className="col-span-2 space-y-2 sm:max-lg:col-span-1 sm:max-lg:pl-1 lg:col-span-1 lg:pl-1">
          <p className="text-sm text-slate-500">Reading Status</p>
          {reviewObject ? (
            <ProgressStatusBadge
              progressStatus={reviewObject.progressStatus}
              className="rounded-md px-3 py-1.5 text-sm"
            />
          ) : (
            <p className="text-sm text-slate-500">No personal entry</p>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-3 border-t border-slate-200/80 pt-4">
        <p className="text-sm text-slate-500">Series Info</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-2 rounded-lg border border-white/40 bg-white/30 px-3 py-2.5 backdrop-blur-sm">
            <BookOpenIcon className="size-4 shrink-0 text-[#ff6b8b]" aria-hidden />
            <div className="min-w-0">
              <p className="text-xs text-slate-500">Chapters</p>
              <p className="truncate text-sm font-medium text-slate-800">
                {chaptersLabel}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-white/40 bg-white/30 px-3 py-2.5 backdrop-blur-sm">
            <LibraryIcon className="size-4 shrink-0 text-[#ff6b8b]" aria-hidden />
            <div className="min-w-0">
              <p className="text-xs text-slate-500">Volumes</p>
              <p className="truncate text-sm font-medium text-slate-800">
                {volumesLabel}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
