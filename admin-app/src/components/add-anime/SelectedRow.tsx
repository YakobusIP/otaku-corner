import { useEffect } from "react";

import {
  displayYear,
  posterUrl
} from "@/components/add-anime/anime-dialog-helpers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { useMalDuplicate } from "@/hooks/useMalDuplicate";

import { cn } from "@/lib/utils";

import type { Anime } from "@tutkli/jikan-ts";
import { CheckCircle2Icon, Loader2Icon, XIcon } from "lucide-react";

type Props = {
  anime: Anime;
  isActive: boolean;
  onPick: () => void;
  onRemove: () => void;
  onDuplicateStatus?: (malId: number, duplicate: boolean | null) => void;
};

export default function SelectedRow({
  anime,
  isActive,
  onPick,
  onRemove,
  onDuplicateStatus
}: Props) {
  const duplicateInDb = useMalDuplicate(anime.mal_id);

  useEffect(() => {
    onDuplicateStatus?.(anime.mal_id, duplicateInDb);
  }, [anime.mal_id, duplicateInDb, onDuplicateStatus]);

  const ringClass =
    duplicateInDb === null
      ? "bg-border/40"
      : duplicateInDb
        ? "bg-gradient-to-br from-rose-600 via-red-500 to-orange-600"
        : "bg-gradient-to-br from-emerald-500 via-teal-400 to-green-500";

  return (
    <li>
      <div
        className={cn(
          "rounded-xl p-[2px] shadow-sm transition-shadow",
          ringClass
        )}
      >
        <div
          role="button"
          tabIndex={0}
          onClick={onPick}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onPick();
            }
          }}
          className={cn(
            "flex cursor-pointer items-center gap-2 rounded-[10px] border p-2 transition-colors",
            isActive
              ? "border-primary/55 bg-card"
              : "border-border/40 bg-card hover:bg-muted/50"
          )}
        >
          <img
            src={posterUrl(anime)}
            alt=""
            className="h-18 w-12 shrink-0 rounded object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold leading-tight">
              {anime.title_english || anime.title}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {anime.title_japanese || anime.title}
            </p>
            <div className="mt-1 flex flex-wrap gap-1">
              <Badge variant="secondary" className="text-[10px]">
                {anime.type ?? "—"}
              </Badge>
              <Badge variant="secondary" className="text-[10px]">
                {displayYear(anime)}
              </Badge>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {duplicateInDb === null ? (
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Loader2Icon className="h-4 w-4 animate-spin" />
              </span>
            ) : duplicateInDb ? (
              <span className="flex items-center gap-1 rounded-md border border-red-500/40 bg-red-950/30 px-2.5 py-1.5 text-sm font-medium text-red-200">
                <XIcon className="h-4 w-4 shrink-0" />
                Duplicate
              </span>
            ) : (
              <span className="flex items-center gap-1 rounded-md border border-emerald-500/40 bg-emerald-950/25 px-2.5 py-1.5 text-sm font-medium text-emerald-100">
                <CheckCircle2Icon className="h-4 w-4 shrink-0 text-emerald-300" />
                No duplicate
              </span>
            )}
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              aria-label={`Remove ${anime.title}`}
            >
              <XIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </li>
  );
}
