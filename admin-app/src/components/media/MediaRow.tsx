import { memo, useState } from "react";

import type { StatusCheck } from "@/components/data-table/DataTableStatuses";
import StatusCheckRows from "@/components/media/StatusCheckRows";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import { ProgressStatusBadge } from "@/components/ui/progress-status-badge";

import { ProgressStatusKey } from "@/lib/enums";
import { MediaType } from "@/types/general.type";

import { ChevronDownIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { Link } from "react-router-dom";

type Props = {
  mediaType: MediaType;
  id: number;
  slug: string;
  title: string;
  titleJapanese: string;
  score: number | null;
  personalScore?: number | null;
  progressStatus: ProgressStatusKey | "";
  imageUrl?: string;
  subtitle?: string;
  statusChecks?: StatusCheck[];
  onRequestDelete?: (mediaType: MediaType, id: number, title: string) => void;
};

const mediaPathMap: Record<MediaType, string> = {
  anime: "anime",
  manga: "manga",
  lightNovel: "light-novel"
};

const mediaLabelMap: Record<MediaType, string> = {
  anime: "Anime",
  manga: "Manga",
  lightNovel: "Light Novel"
};

function MediaRow({
  mediaType,
  id,
  slug,
  title,
  titleJapanese,
  score,
  personalScore,
  progressStatus,
  imageUrl,
  subtitle,
  statusChecks,
  onRequestDelete
}: Props) {
  const [reviewOpen, setReviewOpen] = useState(false);
  const malScore =
    score !== null && Number.isFinite(score) ? score.toFixed(2) : "N/A";
  const personalScoreLabel =
    typeof personalScore === "number" ? personalScore.toFixed(2) : "N/A";
  const hasStatusChecks = statusChecks && statusChecks.length > 0;

  return (
    <Collapsible
      asChild
      className="group"
      {...(hasStatusChecks
        ? { open: reviewOpen, onOpenChange: setReviewOpen }
        : {})}
    >
      <div className="rounded-lg border border-border/40 bg-background shadow-sm transition-colors hover:bg-muted/40">
        <div className="grid grid-cols-1 gap-0 tablet:grid-cols-[minmax(0,1fr)_19rem_auto] tablet:gap-4 tablet:items-center desktop:grid-cols-[minmax(0,1fr)_19rem_auto] desktop:gap-4 desktop:items-center">
          <div className="flex min-w-0 items-center gap-3 p-3 tablet:p-4 desktop:p-4">
            <img
              src={imageUrl}
              alt={title}
              width={40}
              height={56}
              loading="lazy"
              decoding="async"
              className="h-14 w-10 shrink-0 rounded border border-border/50 object-cover"
            />
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2">
                <p className="min-w-0 flex-1 line-clamp-1 font-medium">
                  {title}
                </p>
                <Badge variant="secondary">{mediaLabelMap[mediaType]}</Badge>
              </div>
              <p className="line-clamp-1 text-xs text-muted-foreground">
                {titleJapanese}
              </p>
              {subtitle ? (
                <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                  {subtitle}
                </p>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 border-y border-border/40 bg-muted/10 px-3 py-2 tablet:grid tablet:w-full tablet:grid-cols-[3.75rem_4.75rem_minmax(0,1fr)] tablet:items-start tablet:gap-x-4 tablet:border-0 tablet:bg-transparent tablet:px-0 tablet:py-0 desktop:grid desktop:w-full desktop:grid-cols-[3.75rem_4.75rem_minmax(0,1fr)] desktop:items-start desktop:gap-x-4 desktop:border-0 desktop:bg-transparent desktop:px-0 desktop:py-0">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">MAL</p>
              <p className="text-sm font-medium tabular-nums">{malScore}</p>
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Personal</p>
              <p className="text-sm font-medium tabular-nums">
                {personalScoreLabel}
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Status</p>
              {progressStatus ? (
                <ProgressStatusBadge
                  progressStatus={progressStatus}
                  className="mt-0.5 inline-flex tablet:mt-0 desktop:mt-0"
                />
              ) : null}
            </div>
          </div>

          <div className="flex items-center justify-end gap-1 p-3 tablet:p-4 desktop:p-4">
            {hasStatusChecks ? (
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  title="View review status"
                  className="shrink-0 group"
                >
                  <ChevronDownIcon className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </Button>
              </CollapsibleTrigger>
            ) : null}
            <Link to={`/${mediaPathMap[mediaType]}/${id}/${slug}`}>
              <Button variant="ghost" size="icon" title="Edit">
                <PencilIcon className="h-4 w-4" />
              </Button>
            </Link>
            {onRequestDelete ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                title="Delete"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => onRequestDelete(mediaType, id, title)}
              >
                <Trash2Icon className="h-4 w-4" />
              </Button>
            ) : null}
          </div>

          {hasStatusChecks ? (
            <CollapsibleContent className="col-span-full">
              <div className="w-full border-t border-border/40 bg-muted/10 px-3 py-2 tablet:px-4 desktop:px-4">
                <div className="flex flex-col gap-2">
                  <p className="shrink-0 text-xs font-medium text-muted-foreground">
                    Review progress
                  </p>
                  <div className="min-w-0">
                    <StatusCheckRows
                      checks={statusChecks}
                      barAnimateIn={reviewOpen}
                    />
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          ) : null}
        </div>
      </div>
    </Collapsible>
  );
}

export default memo(MediaRow);
