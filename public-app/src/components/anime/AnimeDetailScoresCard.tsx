import MediaDetailScoresCardCore from "@/components/media-detail/MediaDetailScoresCardCore";

import { AnimeDetail } from "@/types/anime.type";

import {
  getAnimeEpisodeCount,
  getSeasonProgressPercent
} from "@/lib/media-detail/media-detail-helpers";

type AnimeDetailScoresCardProps = {
  animeDetail: AnimeDetail;
};

export default function AnimeDetailScoresCard({
  animeDetail
}: AnimeDetailScoresCardProps) {
  const reviewObject = animeDetail.review;
  const watchedEpisodeCount = animeDetail.episodes.length;
  const totalEpisodeCount = getAnimeEpisodeCount(animeDetail);
  const seasonProgressPercent = getSeasonProgressPercent(
    watchedEpisodeCount,
    totalEpisodeCount
  );

  return (
    <MediaDetailScoresCardCore
      malScore={animeDetail.score}
      personalScore={reviewObject?.personalScore}
      progressStatusLabel="Watch Status"
      review={reviewObject}
      footer={
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
      }
    />
  );
}
