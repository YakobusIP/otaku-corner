import { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ProgressStatusBadge,
  ProgressStatusPill
} from "@/components/ui/progress-status-badge";

import { LightNovelList } from "@/types/lightnovel.type";

import { cn, formatScoreFixedOrNa } from "@/lib/utils";

import { HeartIcon, StarIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type Props = {
  lightNovel: LightNovelList;
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

const formatVolumesLabel = (lightNovel: LightNovelList) => {
  if (lightNovel.volumesCount != null) {
    return `${lightNovel.volumesCount} vol`;
  }
  return null;
};

export default function LightNovelCard({ lightNovel }: Props) {
  const yearLabel = lightNovel.consumedAt
    ? String(new Date(lightNovel.consumedAt).getFullYear())
    : null;

  const volumesLabel = formatVolumesLabel(lightNovel);

  const malScoreBadge = (variant: "overlay" | "inline") => (
    <ScoreBadge
      variant={variant}
      icon={<StarIcon size={12} className="fill-yellow-500 text-yellow-500" />}
      value={formatScoreFixedOrNa(lightNovel.score)}
    />
  );

  const personalScoreBadge = (variant: "overlay" | "inline") =>
    lightNovel.personalScore != null ? (
      <ScoreBadge
        variant={variant}
        icon={<HeartIcon size={12} className="fill-rose-500 text-rose-500" />}
        value={formatScoreFixedOrNa(lightNovel.personalScore)}
      />
    ) : null;

  return (
    <Link href={`/light-novel/${lightNovel.id}/${lightNovel.slug}`}>
      <Card
        className={cn(
          "group flex h-full cursor-pointer text-card-foreground shadow-2xl transition-all duration-300 hover:shadow-3xl",
          "max-md:max-h-none max-md:flex-row max-md:border max-md:border-white/40 max-md:bg-white/80 max-md:backdrop-blur-xl max-md:hover:scale-100",
          "md:max-h-[475px] md:flex-col md:border md:border-white/40 md:bg-white/80 md:backdrop-blur-xl md:hover:scale-105"
        )}
      >
        <div className="relative w-28 shrink-0 md:w-full">
          <Image
            src={
              lightNovel.images.large_image_url ?? lightNovel.images.image_url
            }
            alt={lightNovel.title}
            className="aspect-3/4 size-full object-cover max-md:rounded-l-lg md:rounded-t-lg md:rounded-bl-none"
            width={300}
            height={400}
          />

          <div className="absolute top-2 left-2 md:hidden">
            <ProgressStatusPill progressStatus={lightNovel.progressStatus} />
          </div>

          <div className="absolute top-2 left-2 hidden flex-col items-start gap-1 md:flex">
            {malScoreBadge("overlay")}
            {personalScoreBadge("overlay")}
          </div>

          <div className="absolute top-2 right-2 hidden md:block">
            <ProgressStatusBadge progressStatus={lightNovel.progressStatus} />
          </div>
        </div>

        <CardContent className="flex min-w-0 flex-1 flex-col p-3 md:p-4">
          <h2 className="mb-1 line-clamp-2 text-sm font-bold text-slate-800 group-hover:text-slate-900">
            {lightNovel.title}
          </h2>
          <p className="mb-2 line-clamp-1 text-xs text-slate-600 md:mb-3">
            {lightNovel.titleJapanese}
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
              {lightNovel.status}
            </Badge>
          </div>

          <div className="mt-auto flex items-center justify-between text-xs text-slate-600">
            {volumesLabel ? (
              <span className="rounded bg-slate-800 px-2 py-1 text-white">
                {volumesLabel}
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
