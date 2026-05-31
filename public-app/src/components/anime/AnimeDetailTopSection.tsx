import AnimeDetailPosterTrailer from "@/components/anime/AnimeDetailPosterTrailer";
import AnimeDetailSynopsisCard from "@/components/anime/AnimeDetailSynopsisCard";
import { getSeasonProgressPercent } from "@/components/anime/anime-detail-helpers";
import { Badge } from "@/components/ui/badge";
import { ProgressStatusBadge } from "@/components/ui/progress-status-badge";

import { AnimeDetail } from "@/types/anime.type";

import { formatMalScoreWithMax } from "@/lib/utils";

import {
  Building2Icon,
  CalendarIcon,
  ClockIcon,
  HeartIcon,
  LayersIcon,
  StarIcon
} from "lucide-react";

type AnimeDetailTopSectionProps = {
  animeDetail: AnimeDetail;
  embedUrl?: string;
};

export default function AnimeDetailTopSection({
  animeDetail,
  embedUrl
}: AnimeDetailTopSectionProps) {
  const reviewObject = animeDetail.review;
  const watchedEpisodeCount = animeDetail.episodes.length;
  const totalEpisodeCount =
    animeDetail.episodesCount ?? animeDetail.episodes.length;
  const seasonProgressPercent = getSeasonProgressPercent(
    watchedEpisodeCount,
    totalEpisodeCount
  );
  const genreTags = [
    ...animeDetail.genres.map((genre) => genre.name),
    ...animeDetail.themes.map((theme) => theme.name)
  ];
  const studioLabel = animeDetail.studios.map((studio) => studio.name).join(", ");
  const metaItemClassName =
    "inline-flex items-center gap-1.5 lg:[text-shadow:0_1px_2px_rgba(255,255,255,0.95),0_0_8px_rgba(255,255,255,0.65)]";
  const metaIconClassName = "size-4 text-slate-900";

  const scoresCard = (
    <div className="rounded-2xl border border-white/50 bg-white/45 p-4 shadow-md shadow-rose-100/30 backdrop-blur-md lg:p-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
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

        <div className="space-y-1 border-slate-200/80 lg:border-r lg:px-4">
          <p className="text-sm text-slate-500">My Score</p>
          <p className="flex items-center gap-1.5 text-2xl font-bold text-slate-900">
            <HeartIcon
              className="size-[1em] shrink-0 fill-[#ff6b8b] text-[#ff6b8b]"
              aria-hidden
            />
            {formatMalScoreWithMax(reviewObject?.personalScore)}
          </p>
        </div>

        <div className="col-span-2 space-y-2 lg:col-span-1 lg:pl-1">
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

  return (
    <section className="mb-10 mt-8 flex flex-col gap-6">
      <div className="flex flex-col gap-6 md:grid md:grid-cols-[minmax(240px,280px)_1fr] md:gap-8 lg:items-center">
        <div className="mx-auto w-full max-w-[280px] shrink-0 md:col-start-1 md:row-start-1 md:mx-0 lg:row-span-2 lg:self-center">
          <AnimeDetailPosterTrailer
            posterUrl={
              animeDetail.images.large_image_url || animeDetail.images.image_url
            }
            title={animeDetail.title}
            embedUrl={embedUrl}
          />
        </div>

        <div className="flex h-full min-w-0 items-center md:col-start-2 md:row-start-1">
          <div className="w-full space-y-3 rounded-2xl border border-white/50 bg-white/45 p-4 shadow-md shadow-rose-100/30 backdrop-blur-md lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-none">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 lg:text-[2.5rem] lg:leading-tight">
                {animeDetail.title}
              </h1>
              <p className="mt-1 text-base text-slate-500 lg:text-lg">
                {animeDetail.titleJapanese}
              </p>
            </div>

            {genreTags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {genreTags.map((tag) => (
                  <Badge
                    key={tag}
                    className="rounded-full border-0 bg-[#fde8ef] px-3 py-1 text-xs font-medium text-[#c44569] hover:bg-[#fde8ef]"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            ) : null}

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-900">
              <span className={metaItemClassName}>
                <CalendarIcon className={metaIconClassName} aria-hidden />
                {animeDetail.aired}
              </span>
              <span className={metaItemClassName}>
                <ClockIcon className={metaIconClassName} aria-hidden />
                {animeDetail.duration}
              </span>
              <span className={metaItemClassName}>
                <LayersIcon className={metaIconClassName} aria-hidden />
                {totalEpisodeCount} Episodes
              </span>
            </div>

            {studioLabel ? (
              <p className={`text-sm text-slate-900 ${metaItemClassName}`}>
                <Building2Icon className={metaIconClassName} aria-hidden />
                {studioLabel}
              </p>
            ) : null}
          </div>
        </div>

        <div className="w-full md:col-span-2 md:row-start-2 lg:col-span-1 lg:col-start-2 lg:row-start-2 xl:w-1/2 xl:max-w-[50%]">
          {scoresCard}
        </div>
      </div>

      <AnimeDetailSynopsisCard synopsis={animeDetail.synopsis} />
    </section>
  );
}
