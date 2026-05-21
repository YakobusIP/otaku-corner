import { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ProgressStatusBadge,
  ProgressStatusPill
} from "@/components/ui/progress-status-badge";

import { MangaList } from "@/types/manga.type";

import { cn, formatScoreFixedOrNa } from "@/lib/utils";

import { HeartIcon, StarIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type Props = {
  manga: MangaList;
};

type ScoreBadgeProps = {
  icon: ReactNode;
  value: string;
  variant: "overlay" | "inline";
};

const ScoreBadge = ({ icon, value, variant }: ScoreBadgeProps) => (
  <div
    className={cn(
      "flex items-center gap-1 px-2 py-1 text-xs font-medium leading-none",
      variant === "overlay"
        ? "rounded-full bg-black/70 text-white backdrop-blur-sm"
        : "rounded bg-[#F3C9D6]/30 text-slate-800"
    )}
  >
    {icon}
    <span>{value}</span>
  </div>
);

const formatVolumeChapterLabel = (manga: MangaList) => {
  if (manga.volumesCount != null) {
    return `${manga.volumesCount} vol`;
  }
  if (manga.chaptersCount != null) {
    return `${manga.chaptersCount} ch`;
  }
  return null;
};

export default function MangaCard({ manga }: Props) {
  const yearLabel = manga.consumedAt
    ? String(new Date(manga.consumedAt).getFullYear())
    : null;

  const volumeChapterLabel = formatVolumeChapterLabel(manga);

  const malScoreBadge = (variant: "overlay" | "inline") => (
    <ScoreBadge
      variant={variant}
      icon={<StarIcon size={12} className="fill-yellow-500 text-yellow-500" />}
      value={formatScoreFixedOrNa(manga.score)}
    />
  );

  const personalScoreBadge = (variant: "overlay" | "inline") =>
    manga.personalScore != null ? (
      <ScoreBadge
        variant={variant}
        icon={<HeartIcon size={12} className="fill-rose-500 text-rose-500" />}
        value={formatScoreFixedOrNa(manga.personalScore)}
      />
    ) : null;

  return (
    <Link href={`/manga/${manga.id}/${manga.slug}`}>
      <Card
        className={cn(
          "group flex h-full cursor-pointer text-card-foreground shadow-2xl transition-all duration-300 hover:shadow-3xl",
          "max-md:max-h-none max-md:flex-row max-md:border max-md:border-white/40 max-md:bg-white/80 max-md:backdrop-blur-xl max-md:hover:scale-100",
          "md:max-h-[550px] md:flex-col md:border md:border-white/40 md:bg-white/80 md:backdrop-blur-xl md:hover:scale-105"
        )}
      >
        <div className="relative w-28 shrink-0 md:w-full">
          <Image
            src={manga.images.large_image_url ?? manga.images.image_url}
            alt={manga.title}
            className="aspect-3/4 size-full object-cover max-md:rounded-l-lg md:rounded-t-lg md:rounded-bl-none"
            width={300}
            height={400}
          />

          <div className="absolute top-2 left-2 md:hidden">
            <ProgressStatusPill progressStatus={manga.progressStatus} />
          </div>

          <div className="absolute top-2 left-2 hidden flex-col items-start gap-1 md:flex">
            {malScoreBadge("overlay")}
            {personalScoreBadge("overlay")}
          </div>

          <div className="absolute top-2 right-2 hidden md:block">
            <ProgressStatusBadge progressStatus={manga.progressStatus} />
          </div>
        </div>

        <CardContent className="flex min-w-0 flex-1 flex-col p-3 md:p-4">
          <h2 className="mb-1 line-clamp-2 text-sm font-bold text-slate-800 group-hover:text-slate-900">
            {manga.title}
          </h2>
          <p className="mb-2 line-clamp-1 text-xs text-slate-600 md:mb-3">
            {manga.titleJapanese}
          </p>

          <div className="mb-2 flex flex-wrap items-center gap-1.5 md:hidden">
            {malScoreBadge("inline")}
            {personalScoreBadge("inline")}
          </div>

          <div className="mb-2 flex flex-wrap gap-1 md:mb-3">
            <Badge
              variant="outline"
              className="border-slate-300 text-[10px] text-slate-600 md:text-xs"
            >
              {manga.status}
            </Badge>
          </div>

          <div className="mt-auto flex items-center justify-between text-xs text-slate-600">
            {volumeChapterLabel ? (
              <span className="rounded bg-slate-800 px-2 py-1 text-white">
                {volumeChapterLabel}
              </span>
            ) : (
              <span />
            )}
            {yearLabel ? <span>{yearLabel}</span> : null}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
