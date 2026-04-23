import { Badge } from "@/components/ui/badge";

import { AnimeDetail } from "@/types/anime.type";

import {
  BookOpenIcon,
  CalendarIcon,
  DramaIcon,
  LayersIcon,
  MonitorPlayIcon,
  PaletteIcon,
  RadioIcon,
  ShieldIcon,
  SignalIcon,
  SparklesIcon,
  TagIcon
} from "lucide-react";

type Props = {
  animeDetail: AnimeDetail;
};

export default function AnimeInfoSection({ animeDetail }: Props) {
  const infoItems = [
    {
      key: "type",
      label: "Type",
      value: animeDetail.type || "—",
      icon: MonitorPlayIcon,
      accent: "text-indigo-300"
    },
    {
      key: "status",
      label: "Airing Status",
      value: animeDetail.status || "—",
      icon: SignalIcon,
      accent: "text-cyan-300"
    },
    {
      key: "rating",
      label: "Rating",
      value: animeDetail.rating || "—",
      icon: ShieldIcon,
      accent: "text-violet-300"
    },
    {
      key: "season",
      label: "Season",
      value: animeDetail.season || "—",
      icon: SparklesIcon,
      accent: "text-amber-300"
    },
    {
      key: "aired",
      label: "Aired",
      value: animeDetail.aired || "—",
      icon: CalendarIcon,
      accent: "text-sky-300"
    },
    {
      key: "broadcast",
      label: "Broadcast",
      value: animeDetail.broadcast || "—",
      icon: RadioIcon,
      accent: "text-rose-300"
    },
    {
      key: "source",
      label: "Source",
      value: animeDetail.source || "—",
      icon: BookOpenIcon,
      accent: "text-emerald-300"
    }
  ];

  const entityGroups = [
    {
      key: "genres",
      label: "Genres",
      icon: TagIcon,
      accent:
        "bg-gradient-to-br from-indigo-500/15 to-transparent border-indigo-400/30",
      iconColor: "text-indigo-300",
      items: animeDetail.genres.map((g) => ({ id: g.id, name: g.name }))
    },
    {
      key: "themes",
      label: "Themes",
      icon: DramaIcon,
      accent:
        "bg-gradient-to-br from-fuchsia-500/15 to-transparent border-fuchsia-400/30",
      iconColor: "text-fuchsia-300",
      items: animeDetail.themes.map((t) => ({ id: t.id, name: t.name }))
    },
    {
      key: "studios",
      label: "Studios",
      icon: PaletteIcon,
      accent:
        "bg-gradient-to-br from-emerald-500/15 to-transparent border-emerald-400/30",
      iconColor: "text-emerald-300",
      items: animeDetail.studios.map((s) => ({ id: s.id, name: s.name }))
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="rounded-2xl border border-border/40 bg-background/35 p-4 shadow-sm backdrop-blur-sm sm:p-5">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border/40 bg-background/35 shadow-sm backdrop-blur-sm">
            <LayersIcon className="h-4 w-4 text-indigo-300" />
          </div>
          <h3 className="text-base font-semibold">Production Details</h3>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {infoItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.key}
                className="flex items-start gap-3 rounded-lg border border-border/40 bg-background/35 p-3 shadow-sm backdrop-blur-sm"
              >
                <Icon className={`h-4 w-4 shrink-0 mt-0.5 ${item.accent}`} />
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {item.label}
                  </p>
                  <p className="break-words text-sm font-medium text-foreground">
                    {item.value}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-border/40 bg-background/35 p-4 shadow-sm backdrop-blur-sm sm:p-5">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border/40 bg-background/35 shadow-sm backdrop-blur-sm">
            <TagIcon className="h-4 w-4 text-fuchsia-300" />
          </div>
          <h3 className="text-base font-semibold">Classification</h3>
        </div>

        <div className="flex flex-col gap-3">
          {entityGroups.map((group) => {
            const Icon = group.icon;
            return (
              <div
                key={group.key}
                className={`rounded-lg border p-3 ${group.accent}`}
              >
                <div className="mb-2 flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${group.iconColor}`} />
                  <p className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
                    {group.label}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {group.items.length}
                  </span>
                </div>
                {group.items.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {group.items.map((entity) => (
                      <Badge
                        key={entity.id}
                        variant="secondary"
                        className="border border-border/40 bg-background/35 shadow-sm backdrop-blur-sm"
                      >
                        {entity.name}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs italic text-muted-foreground">
                    None listed
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
