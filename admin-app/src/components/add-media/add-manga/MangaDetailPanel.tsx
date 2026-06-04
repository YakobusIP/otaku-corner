import MetaRow from "@/components/add-media/MetaRow";
import { Badge } from "@/components/ui/badge";

import {
  displayYearFromPublished,
  formatPublished,
  posterUrl
} from "@/lib/media-dialog-helpers";

import type { Manga } from "@tutkli/jikan-ts";
import type { LucideIcon } from "lucide-react";
import {
  BookMarkedIcon,
  CalendarDaysIcon,
  LibraryIcon,
  ListOrderedIcon,
  SparklesIcon,
  StarIcon,
  TagsIcon,
  UsersIcon
} from "lucide-react";

type Props = {
  manga: Manga;
};

export default function MangaDetailPanel({ manga }: Props) {
  const synopsis =
    manga.synopsis?.replace(/\n\n+/g, "\n").trim() || "No synopsis available.";

  const metaRows: { icon: LucideIcon; label: string; value: string }[] = [
    { icon: BookMarkedIcon, label: "Status", value: manga.status ?? "—" },
    {
      icon: CalendarDaysIcon,
      label: "Published",
      value: formatPublished(manga)
    },
    {
      icon: ListOrderedIcon,
      label: "Chapters",
      value: manga.chapters != null ? String(manga.chapters) : "?"
    },
    {
      icon: LibraryIcon,
      label: "Volumes",
      value: manga.volumes != null ? String(manga.volumes) : "?"
    },
    {
      icon: UsersIcon,
      label: "Authors",
      value: manga.authors?.map((a) => a.name).join(", ") || "—"
    },
    {
      icon: TagsIcon,
      label: "Genres",
      value: manga.genres?.map((g) => g.name).join(", ") || "—"
    },
    {
      icon: SparklesIcon,
      label: "Themes",
      value: manga.themes?.map((t) => t.name).join(", ") || "—"
    }
  ];

  return (
    <div className="min-h-0 space-y-3 text-sm">
      <div className="flex gap-3">
        <img
          src={posterUrl(manga)}
          alt=""
          className="h-36 w-24 shrink-0 rounded-lg object-cover"
        />
        <div className="min-w-0 flex-1 space-y-1">
          <p className="font-semibold leading-snug">
            {manga.title_english || manga.title}
          </p>
          <div className="flex flex-wrap gap-1 text-xs text-muted-foreground">
            <Badge variant="outline">{manga.type ?? "—"}</Badge>
            <Badge variant="outline">{displayYearFromPublished(manga)}</Badge>
          </div>
          <div className="flex items-center gap-1 text-xs text-amber-400">
            <StarIcon className="h-3.5 w-3.5 fill-current" />
            <span className="font-medium">
              {manga.score != null ? manga.score.toFixed(2) : "—"}
            </span>
            <span className="text-muted-foreground">
              ({manga.scored_by?.toLocaleString() ?? "—"} users)
            </span>
          </div>
        </div>
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground">
        {synopsis}
      </p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
        {metaRows.map((row) => (
          <MetaRow
            key={row.label}
            icon={row.icon}
            label={row.label}
            value={row.value}
          />
        ))}
      </div>
    </div>
  );
}
