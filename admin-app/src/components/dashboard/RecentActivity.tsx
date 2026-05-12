import QueryErrorState from "@/components/dashboard/QueryErrorState";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import type { RecentReviewItem } from "@/types/statistic.type";

import { dashboardPosterSrc } from "@/lib/dashboard-poster";
import { MEDIA_TYPE } from "@/lib/enums";

import { formatDistanceToNow } from "date-fns";
import { StarIcon } from "lucide-react";
import { Link } from "react-router-dom";

type Props = {
  items: RecentReviewItem[] | undefined;
  isLoading: boolean;
  error: unknown | null;
};

const detailHref = (row: RecentReviewItem) => {
  if (row.mediaType === "anime") {
    return `/anime/${row.mediaId}/${row.slug}`;
  }
  if (row.mediaType === "manga") {
    return `/manga/${row.mediaId}/${row.slug}`;
  }
  return `/light-novel/${row.mediaId}/${row.slug}`;
};

const typeBadge = (mediaType: RecentReviewItem["mediaType"]) => {
  if (mediaType === "anime") {
    return {
      label: MEDIA_TYPE.ANIME,
      className: "border-sky-500/50 text-sky-300"
    };
  }
  if (mediaType === "manga") {
    return {
      label: MEDIA_TYPE.MANGA,
      className: "border-emerald-500/50 text-emerald-300"
    };
  }
  return {
    label: MEDIA_TYPE.LIGHT_NOVEL,
    className: "border-violet-500/50 text-violet-300"
  };
};

export default function RecentActivity({ items, isLoading, error }: Props) {
  if (error) {
    return (
      <Card className="border-border/60 bg-card/80 backdrop-blur-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <QueryErrorState error={error} />
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="border-border/60 bg-card/80 backdrop-blur-xl">
        <CardHeader className="pb-4">
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full rounded-lg" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const rows = items ?? [];

  return (
    <Card className="border-border/60 bg-card/80 backdrop-blur-xl">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No reviews yet.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {rows.slice(0, 5).map((row) => {
              const poster = dashboardPosterSrc(row.images);
              const badge = typeBadge(row.mediaType);
              const when = formatDistanceToNow(new Date(row.updatedAt), {
                addSuffix: true
              });

              return (
                <li key={`${row.mediaType}-${row.mediaId}-${row.updatedAt}`}>
                  <Link
                    to={detailHref(row)}
                    className="flex items-center gap-3 rounded-xl border border-transparent p-2 transition hover:border-border/60 hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <div className="h-12 w-9 shrink-0 overflow-hidden rounded-md bg-muted/50">
                      {poster ? (
                        <img
                          src={poster}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium leading-snug">
                        {row.title}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${badge.className}`}
                        >
                          {badge.label}
                        </Badge>
                        {row.personalScore != null ? (
                          <span className="inline-flex items-center gap-0.5 text-xs text-amber-400">
                            <StarIcon className="h-3 w-3 fill-current" />
                            {row.personalScore.toFixed(2)}
                          </span>
                        ) : null}
                        <span className="text-xs text-muted-foreground">
                          {when}
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
