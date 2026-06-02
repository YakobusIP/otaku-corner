import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { RecentReviewItem } from "@/types/statistic.type";

import { formatRelativeUpdatedAt } from "@/lib/format-relative-updated";
import { pickMediaImageSrc } from "@/lib/media-images";
import {
  PUBLIC_MEDIA_TYPE_CONFIG,
  buildPublicMediaDetailHref
} from "@/lib/public-media-type";
import { formatScoreFixedOrNa } from "@/lib/utils";

import { FlowerIcon, StarIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type HomeRecentReviewsCarouselCardProps = {
  items: RecentReviewItem[];
};

export default function HomeRecentReviewsCarouselCard(
  props: HomeRecentReviewsCarouselCardProps
) {
  const { items } = props;

  return (
    <Card className="relative z-10 flex h-full min-h-[320px] flex-col border-white/90 bg-white/95 shadow-[0_18px_50px_rgba(15,23,42,0.08),0_1px_0_rgba(255,255,255,0.9)_inset] backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-2 p-4 pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-bold leading-snug text-[#4a1630]">
          Recent Journey
          <FlowerIcon className="h-4 w-4 text-rose-300" aria-hidden />
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-1.5 p-4 pt-0">
        {items.length === 0 ? (
          <p className="text-sm text-[#6b5b6b]">No reviews yet.</p>
        ) : (
          items.map((item) => {
            const display = PUBLIC_MEDIA_TYPE_CONFIG[item.mediaType];
            const href = buildPublicMediaDetailHref(
              item.mediaType,
              item.mediaId,
              item.slug
            );
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
                      className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${display.reviewBadgeClass}`}
                    >
                      {display.reviewBadgeLabel}
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
