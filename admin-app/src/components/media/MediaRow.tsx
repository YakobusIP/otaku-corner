import type { StatusCheck } from "@/components/data-table/DataTableStatuses";
import StatusCheckRows from "@/components/data-table/StatusCheckRows";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import { ProgressStatusBadge } from "@/components/ui/progress-status-badge";

import { ChevronDownIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { Link } from "react-router-dom";

type Props = {
  mediaType: "anime" | "manga" | "lightNovel";
  id: number;
  slug: string;
  title: string;
  titleJapanese: string;
  score: number | null;
  personalScore?: number | null;
  progressStatus: string;
  imageUrl?: string;
  subtitle?: string;
  statusChecks?: StatusCheck[];
  onDelete?: (mediaType: "anime" | "manga" | "lightNovel", id: number) => void;
};

const mediaPathMap: Record<Props["mediaType"], string> = {
  anime: "anime",
  manga: "manga",
  lightNovel: "light-novel"
};

const mediaLabelMap: Record<Props["mediaType"], string> = {
  anime: "Anime",
  manga: "Manga",
  lightNovel: "Light Novel"
};

export default function MediaRow({
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
  onDelete
}: Props) {
  const malScore =
    score !== null && Number.isFinite(score) ? score.toFixed(2) : "N/A";
  const personalScoreLabel =
    typeof personalScore === "number" ? personalScore.toFixed(2) : "N/A";
  const hasStatusChecks = statusChecks && statusChecks.length > 0;

  return (
    <Collapsible asChild className="group">
      <div className="rounded-lg border border-border/40 bg-background/35 shadow-sm backdrop-blur-sm transition-colors hover:bg-background/45">
        <div className="grid grid-cols-1 gap-0 md:grid-cols-[minmax(0,1fr)_19rem_auto] md:gap-4 md:items-center">
          <div className="flex min-w-0 items-center gap-3 p-3 md:p-4">
            <img
              src={imageUrl}
              alt={title}
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

          <div className="grid grid-cols-3 gap-2 border-y border-border/40 bg-muted/10 px-3 py-2 md:grid md:w-full md:grid-cols-[3.75rem_4.75rem_minmax(0,1fr)] md:items-start md:gap-x-4 md:border-0 md:bg-transparent md:px-0 md:py-0">
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
              <ProgressStatusBadge
                progressStatus={progressStatus as never}
                className="mt-0.5 inline-flex md:mt-0"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-1 p-3 md:p-4">
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
            {onDelete ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Delete"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2Icon className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this item?</AlertDialogTitle>
                    <AlertDialogDescription>
                      &quot;{title}&quot; will be permanently removed. This
                      action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDelete(mediaType, id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : null}
          </div>

          {hasStatusChecks ? (
            <CollapsibleContent className="col-span-full">
              <div className="w-full border-t border-border/40 bg-muted/10 px-3 py-2 md:px-4">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Review progress
                </p>
                <StatusCheckRows checks={statusChecks} />
              </div>
            </CollapsibleContent>
          ) : null}
        </div>
      </div>
    </Collapsible>
  );
}
