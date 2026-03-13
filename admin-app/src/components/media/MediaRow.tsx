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
import { ProgressStatusBadge } from "@/components/ui/progress-status-badge";

import { PencilIcon, Trash2Icon } from "lucide-react";
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
  onDelete
}: Props) {
  const malScore = Number.isFinite(score) ? score.toFixed(2) : "N/A";
  const personalScoreLabel =
    typeof personalScore === "number" ? personalScore.toFixed(2) : "N/A";

  return (
    <div className="rounded-lg border border-border/50 bg-card/70 transition-colors hover:bg-muted/20">
      <div className="grid grid-cols-1 gap-0 sm:grid-cols-[1fr_auto_auto] sm:gap-4 sm:items-center">
        <div className="flex min-w-0 items-center gap-3 p-3 sm:p-4">
          <img
            src={imageUrl}
            alt={title}
            className="h-14 w-10 shrink-0 rounded border border-border/50 object-cover"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="line-clamp-1 font-medium">{title}</p>
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

        <div className="grid grid-cols-3 gap-2 border-y border-border/40 bg-muted/10 px-3 py-2 sm:flex sm:flex-row sm:border-0 sm:bg-transparent sm:gap-6 sm:px-0 sm:py-0">
          <div>
            <p className="text-xs text-muted-foreground">MAL</p>
            <p className="text-sm font-medium">{malScore}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Personal</p>
            <p className="text-sm font-medium">{personalScoreLabel}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <ProgressStatusBadge
              progressStatus={progressStatus as never}
              className="mt-0.5 inline-flex text-primary-foreground sm:mt-0"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-1 p-3 sm:p-4">
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
                    &quot;{title}&quot; will be permanently removed. This action
                    cannot be undone.
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
      </div>
    </div>
  );
}
