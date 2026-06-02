import LightNovelDetailPoster from "@/components/light-novel/LightNovelDetailPoster";
import LightNovelDetailScoresCard from "@/components/light-novel/LightNovelDetailScoresCard";
import { formatLightNovelVolumesLabel } from "@/components/light-novel/light-novel-detail-helpers";
import { Badge } from "@/components/ui/badge";

import { LightNovelDetail } from "@/types/lightnovel.type";

import { cn } from "@/lib/utils";

import {
  BookOpenIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon
} from "lucide-react";

type LightNovelDetailTopSectionProps = {
  lightNovelDetail: LightNovelDetail;
  showScoresInGrid?: boolean;
};

export default function LightNovelDetailTopSection({
  lightNovelDetail,
  showScoresInGrid = false
}: LightNovelDetailTopSectionProps) {
  const genreTags = [
    ...lightNovelDetail.genres.map((genre) => genre.name),
    ...lightNovelDetail.themes.map((theme) => theme.name)
  ];
  const authorLabel = lightNovelDetail.authors
    .map((author) => author.name)
    .join(", ");
  const volumesLabel = formatLightNovelVolumesLabel(
    lightNovelDetail.volumesCount
  );
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
        <LightNovelDetailPoster
          posterUrl={
            lightNovelDetail.images.large_image_url ||
            lightNovelDetail.images.image_url
          }
          title={lightNovelDetail.title}
        />
      </div>

      <div className="flex h-full min-w-0 items-center md:col-start-2 md:row-start-1">
        <div className="w-full space-y-3 rounded-2xl border border-white/50 bg-white/45 p-4 shadow-md shadow-rose-100/30 backdrop-blur-md lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-none">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 lg:text-[2.5rem] lg:leading-tight">
              {lightNovelDetail.title}
            </h1>
            <p className="mt-1 text-base text-slate-500 lg:text-lg">
              {lightNovelDetail.titleJapanese}
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
              {lightNovelDetail.published}
            </span>
            <span className={metaItemClassName}>
              <BookOpenIcon className={metaIconClassName} aria-hidden />
              {volumesLabel}
            </span>
            <span className={metaItemClassName}>
              <ClockIcon className={metaIconClassName} aria-hidden />
              {lightNovelDetail.status}
            </span>
          </div>

          {authorLabel ? (
            <p className={`text-sm text-slate-900 ${metaItemClassName}`}>
              <UserIcon className={metaIconClassName} aria-hidden />
              {authorLabel}
            </p>
          ) : null}
        </div>
      </div>

      {showScoresInGrid ? (
        <div className="w-full md:col-span-2 md:row-start-2 lg:col-span-1 lg:col-start-2 lg:row-start-2 xl:w-1/2 xl:max-w-[50%]">
          <LightNovelDetailScoresCard lightNovelDetail={lightNovelDetail} />
        </div>
      ) : null}
    </div>
  );
}
