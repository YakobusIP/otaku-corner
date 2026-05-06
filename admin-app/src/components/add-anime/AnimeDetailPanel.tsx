import {
  displayYear,
  formatAired,
  formatRatingLabel,
  posterUrl
} from "@/components/add-anime/anime-dialog-helpers";
import MetaRow from "@/components/add-anime/MetaRow";
import { Badge } from "@/components/ui/badge";

import type { Anime } from "@tutkli/jikan-ts";
import type { LucideIcon } from "lucide-react";
import {
  ActivityIcon,
  BookOpenIcon,
  Building2Icon,
  CalendarDaysIcon,
  ListOrderedIcon,
  ShieldIcon,
  SparklesIcon,
  StarIcon,
  TagsIcon
} from "lucide-react";

type Props = {
  anime: Anime;
};

export default function AnimeDetailPanel({ anime }: Props) {
  const synopsis =
    anime.synopsis?.replace(/\n\n+/g, "\n").trim() || "No synopsis available.";

  const metaRows: { icon: LucideIcon; label: string; value: string }[] = [
    { icon: ActivityIcon, label: "Status", value: anime.status ?? "—" },
    { icon: CalendarDaysIcon, label: "Aired", value: formatAired(anime) },
    {
      icon: ListOrderedIcon,
      label: "Episodes",
      value: anime.episodes != null ? String(anime.episodes) : "?"
    },
    {
      icon: Building2Icon,
      label: "Studio",
      value: anime.studios?.[0]?.name ?? "—"
    },
    { icon: BookOpenIcon, label: "Source", value: anime.source ?? "—" },
    {
      icon: TagsIcon,
      label: "Genres",
      value: anime.genres?.map((g) => g.name).join(", ") || "—"
    },
    {
      icon: SparklesIcon,
      label: "Themes",
      value: anime.themes?.map((t) => t.name).join(", ") || "—"
    },
    { icon: ShieldIcon, label: "Rating", value: formatRatingLabel(anime) }
  ];

  return (
    <div className="min-h-0 space-y-3 text-sm">
      <div className="flex gap-3">
        <img
          src={posterUrl(anime)}
          alt=""
          className="h-36 w-24 shrink-0 rounded-lg object-cover"
        />
        <div className="min-w-0 flex-1 space-y-1">
          <p className="font-semibold leading-snug">
            {anime.title_english || anime.title}
          </p>
          <div className="flex flex-wrap gap-1 text-xs text-muted-foreground">
            <Badge variant="outline">{anime.type ?? "—"}</Badge>
            <Badge variant="outline">{displayYear(anime)}</Badge>
          </div>
          <div className="flex items-center gap-1 text-xs text-amber-400">
            <StarIcon className="h-3.5 w-3.5 fill-current" />
            <span className="font-medium">
              {anime.score != null ? anime.score.toFixed(2) : "—"}
            </span>
            <span className="text-muted-foreground">
              ({anime.scored_by?.toLocaleString() ?? "—"} users)
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
