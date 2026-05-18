import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { RecentReviewItem } from "@/types/statistic.type";

import { formatRelativeUpdatedAt } from "@/lib/format-relative-updated";
import { pickMediaImageSrc } from "@/lib/media-images";
import { formatScoreFixedOrNa } from "@/lib/utils";

import { Flower2Icon, StarIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type HomeRecentReviewsCarouselCardProps = {
  items: RecentReviewItem[] | undefined;
};

const mediaHref = (item: RecentReviewItem) => {
  if (item.mediaType === "anime") {
    return `/anime/${item.mediaId}/${item.slug}`;
  }
  if (item.mediaType === "manga") {
    return `/manga/${item.mediaId}/${item.slug}`;
  }
  return `/light-novel/${item.mediaId}/${item.slug}`;
};

const mediaLabel = (item: RecentReviewItem) => {
  if (item.mediaType === "anime") {
    return "Anime";
  }
  if (item.mediaType === "manga") {
    return "Manga";
  }
  return "Light Novel";
};

const mediaBadgeClass = (item: RecentReviewItem) => {
  if (item.mediaType === "anime") {
    return "bg-rose-100 text-rose-700 ring-rose-200/60";
  }
  if (item.mediaType === "manga") {
    return "bg-violet-100 text-violet-700 ring-violet-200/60";
  }
  return "bg-orange-100 text-orange-700 ring-orange-200/60";
};

export default function HomeRecentReviewsCarouselCard(
  props: HomeRecentReviewsCarouselCardProps
) {
  const { items } = props;
  const list = items ?? [];

  return (
    <Card className="flex h-full min-h-[320px] flex-col border-white/80 bg-white/85 shadow-[0_18px_60px_rgba(244,114,182,0.16)] backdrop-blur-xl">
      <CardHeader className="flex flex-row items-center justify-between gap-2 p-4 pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-bold leading-snug text-[#4a1630]">
          Recent Journey
          <Flower2Icon className="h-4 w-4 text-rose-300" aria-hidden />
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-1.5 p-4 pt-0">
        {list.length === 0 ? (
          <p className="text-sm text-[#6b5b6b]">No reviews yet.</p>
        ) : (
          list.map((item) => {
            const href = mediaHref(item);
            return (
              <Link
                key={`${item.mediaType}-${item.mediaId}-${item.updatedAt}`}
                href={href}
                className="flex gap-2 rounded-lg border border-rose-100/70 bg-white/65 p-1.5 transition-colors hover:border-rose-200/90 hover:bg-white"
              >
                <div className="relative h-11 w-9 shrink-0 overflow-hidden rounded-lg bg-rose-100">
                  <Image
                    src={pickMediaImageSrc(item.images)}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="36px"
                  />
                </div>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className="line-clamp-1 text-sm font-semibold text-[#3f2b40]">
                    {item.title}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${mediaBadgeClass(item)}`}
                    >
                      {mediaLabel(item)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold tabular-nums text-[#4b3a4c]">
                      <StarIcon
                        className="h-3 w-3 fill-amber-400 text-amber-400"
                        aria-hidden
                      />
                      {formatScoreFixedOrNa(item.personalScore)}
                    </span>
                    <span className="text-[11px] text-[#7b6c7c]">
                      {formatRelativeUpdatedAt(item.updatedAt)}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
