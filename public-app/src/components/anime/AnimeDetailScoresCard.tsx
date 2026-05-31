import { getSeasonProgressPercent } from "@/components/anime/anime-detail-helpers";
import { ProgressStatusBadge } from "@/components/ui/progress-status-badge";

import { AnimeDetail } from "@/types/anime.type";

import { formatMalScoreWithMax } from "@/lib/utils";

import { HeartIcon, StarIcon } from "lucide-react";

type AnimeDetailScoresCardProps = {
  animeDetail: AnimeDetail;
  className?: string;
};

export default function AnimeDetailScoresCard({
  animeDetail,
  className
}: AnimeDetailScoresCardProps) {
  const reviewObject = animeDetail.review;
  const watchedEpisodeCount = animeDetail.episodes.length;
  const totalEpisodeCount =
    animeDetail.episodesCount ?? animeDetail.episodes.length;
  const seasonProgressPercent = getSeasonProgressPercent(
    watchedEpisodeCount,
    totalEpisodeCount
  );

  return (
    <div
      className={
        className ??
        "rounded-2xl border border-white/50 bg-white/45 p-4 shadow-md shadow-rose-100/30 backdrop-blur-md lg:p-5"
      }
    >
      <div className="grid grid-cols-2 gap-4 sm:max-lg:grid-cols-3 lg:grid-cols-3">
        <div className="space-y-1 border-slate-200/80 border-r pr-4">
          <p className="text-sm text-slate-500">MAL Score</p>
          <p className="flex items-center gap-1.5 text-2xl font-bold text-slate-900">
            <StarIcon
              className="size-[1em] shrink-0 fill-amber-400 text-amber-400"
              aria-hidden
            />
            {formatMalScoreWithMax(animeDetail.score)}
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
          <p className="text-sm text-slate-500">Watch Status</p>
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

      <div className="mt-4 space-y-2 border-t border-slate-200/80 pt-4">
        <p className="text-sm text-slate-500">Season Progress</p>
        <div
          className="h-2 overflow-hidden rounded-full bg-slate-200/80"
          role="progressbar"
          aria-valuenow={seasonProgressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Season progress"
        >
          <div
            className="h-full rounded-full bg-[#ff6b8b] transition-all duration-500"
            style={{ width: `${seasonProgressPercent}%` }}
          />
        </div>
        <p className="text-right text-sm font-medium text-slate-600">
          {watchedEpisodeCount} / {totalEpisodeCount} Episodes
        </p>
      </div>
    </div>
  );
}
