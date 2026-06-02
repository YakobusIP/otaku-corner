import MangaDetailPoster from "@/components/manga/MangaDetailPoster";
import MangaDetailScoresCard from "@/components/manga/MangaDetailScoresCard";
import { formatMangaChaptersLabel } from "@/components/manga/manga-detail-helpers";
import { Badge } from "@/components/ui/badge";

import { MangaDetail } from "@/types/manga.type";

import { cn } from "@/lib/utils";

import { BookOpenIcon, CalendarIcon, ClockIcon, UserIcon } from "lucide-react";

type MangaDetailTopSectionProps = {
  mangaDetail: MangaDetail;
  showScoresInGrid?: boolean;
};

export default function MangaDetailTopSection({
  mangaDetail,
  showScoresInGrid = false
}: MangaDetailTopSectionProps) {
  const genreTags = [
    ...mangaDetail.genres.map((genre) => genre.name),
    ...mangaDetail.themes.map((theme) => theme.name)
  ];
  const authorLabel = mangaDetail.authors.map((author) => author.name).join(", ");
  const chaptersLabel = formatMangaChaptersLabel(mangaDetail.chaptersCount);
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
        <MangaDetailPoster
          posterUrl={
            mangaDetail.images.large_image_url || mangaDetail.images.image_url
          }
          title={mangaDetail.title}
        />
      </div>

      <div className="flex h-full min-w-0 items-center md:col-start-2 md:row-start-1">
        <div className="w-full space-y-3 rounded-2xl border border-white/50 bg-white/45 p-4 shadow-md shadow-rose-100/30 backdrop-blur-md lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-none">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 lg:text-[2.5rem] lg:leading-tight">
              {mangaDetail.title}
            </h1>
            <p className="mt-1 text-base text-slate-500 lg:text-lg">
              {mangaDetail.titleJapanese}
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
              {mangaDetail.published}
            </span>
            <span className={metaItemClassName}>
              <BookOpenIcon className={metaIconClassName} aria-hidden />
              {chaptersLabel}
            </span>
            <span className={metaItemClassName}>
              <ClockIcon className={metaIconClassName} aria-hidden />
              {mangaDetail.status}
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
          <MangaDetailScoresCard mangaDetail={mangaDetail} />
        </div>
      ) : null}
    </div>
  );
}
