import AnimeDetailPosterTrailer from "@/components/anime/AnimeDetailPosterTrailer";
import AnimeDetailScoresCard from "@/components/anime/AnimeDetailScoresCard";
import { Badge } from "@/components/ui/badge";

import { AnimeDetail } from "@/types/anime.type";

import { cn } from "@/lib/utils";

import {
  Building2Icon,
  CalendarIcon,
  ClockIcon,
  LayersIcon
} from "lucide-react";

type AnimeDetailTopSectionProps = {
  animeDetail: AnimeDetail;
  embedUrl?: string;
  showScoresInGrid?: boolean;
};

export default function AnimeDetailTopSection({
  animeDetail,
  embedUrl,
  showScoresInGrid = false
}: AnimeDetailTopSectionProps) {
  const totalEpisodeCount =
    animeDetail.episodesCount ?? animeDetail.episodes.length;
  const genreTags = [
    ...animeDetail.genres.map((genre) => genre.name),
    ...animeDetail.themes.map((theme) => theme.name)
  ];
  const studioLabel = animeDetail.studios.map((studio) => studio.name).join(", ");
  const metaItemClassName =
    "inline-flex items-center gap-1.5 lg:[text-shadow:0_1px_2px_rgba(255,255,255,0.95),0_0_8px_rgba(255,255,255,0.65)]";
  const metaIconClassName = "size-4 text-slate-900";

  return (
    <div
      className={cn(
        "flex flex-col gap-6 md:grid md:grid-cols-[minmax(240px,280px)_1fr] md:gap-8",
        showScoresInGrid && "lg:items-center"
      )}
    >
      <div
        className={cn(
          "mx-auto w-full max-w-[280px] shrink-0 md:col-start-1 md:row-start-1 md:mx-0",
          showScoresInGrid && "lg:row-span-2 lg:self-center"
        )}
      >
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

      {showScoresInGrid ? (
        <div className="w-full md:col-span-2 md:row-start-2 lg:col-span-1 lg:col-start-2 lg:row-start-2 xl:w-1/2 xl:max-w-[50%]">
          <AnimeDetailScoresCard animeDetail={animeDetail} />
        </div>
      ) : null}
    </div>
  );
}
