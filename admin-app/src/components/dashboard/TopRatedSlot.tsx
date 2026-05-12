import { Fragment } from "react";

import type { TopRatedThisYear } from "@/types/statistic.type";

import { dashboardPosterSrc } from "@/lib/dashboard-poster";

import { StarIcon } from "lucide-react";
import { Link } from "react-router-dom";

type MediaSlot = "anime" | "manga" | "lightNovel";

const detailHref = (mediaType: MediaSlot, id: number, slug: string) => {
  if (mediaType === "anime") return `/anime/${id}/${slug}`;
  if (mediaType === "manga") return `/manga/${id}/${slug}`;
  return `/light-novel/${id}/${slug}`;
};

type TopRatedSlotProps = {
  label: string;
  labelClassName: string;
  row: TopRatedThisYear["anime"];
  mediaType: MediaSlot;
};

export default function TopRatedSlot(props: TopRatedSlotProps) {
  const { label, labelClassName, row, mediaType } = props;
  const poster = row ? dashboardPosterSrc(row.images) : null;

  const inner = (
    <Fragment>
      <p
        className={`mb-3 shrink-0 text-center text-xs font-semibold uppercase tracking-wide ${labelClassName}`}
      >
        {label}
      </p>
      <div className="relative aspect-3/5 w-full shrink-0 overflow-hidden rounded-lg bg-muted/40">
        {poster ? (
          <img src={poster} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-3 py-5 text-muted-foreground sm:px-4 sm:py-6">
            <img
              src="/no-poster.webp"
              alt=""
              className="h-auto max-h-[92%] w-full max-w-full shrink-0 object-contain object-center"
            />
            <p className="text-center text-lg font-medium leading-snug sm:text-base">
              No poster
            </p>
          </div>
        )}
      </div>
      <div className="mt-3 shrink-0 space-y-1 text-center">
        <p className="line-clamp-2 text-sm font-semibold leading-snug">
          {row?.title ?? "No Data"}
        </p>
        <div className="flex items-center justify-center gap-1 text-sm text-amber-400">
          <StarIcon className="h-3.5 w-3.5 shrink-0 fill-current" />
          <span className="font-medium tabular-nums">
            {row?.personalScore != null
              ? row.personalScore.toFixed(2)
              : "No Data"}
          </span>
        </div>
      </div>
    </Fragment>
  );

  const base = "flex w-full flex-col items-center justify-center rounded-xl";

  if (row?.slug) {
    return (
      <Link
        to={detailHref(mediaType, row.id, row.slug)}
        className={`${base} outline-none transition hover:bg-accent/5 focus-visible:ring-2 focus-visible:ring-ring`}
      >
        {inner}
      </Link>
    );
  }

  return <div className={base}>{inner}</div>;
}
