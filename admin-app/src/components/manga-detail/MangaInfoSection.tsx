import EditChapterVolumesModal from "@/components/manga-detail/EditChapterVolumesModal";
import { Badge } from "@/components/ui/badge";

import { MangaDetail } from "@/types/manga.type";

import {
  BookOpenIcon,
  CalendarIcon,
  DramaIcon,
  HashIcon,
  LayersIcon,
  LibraryBigIcon,
  PenLineIcon,
  SignalIcon,
  SparklesIcon,
  TagIcon,
  TypeIcon
} from "lucide-react";

type Props = {
  mangaDetail: MangaDetail;
};

export default function MangaInfoSection({ mangaDetail }: Props) {
  const infoItems = [
    {
      key: "status",
      label: "Serialization",
      value: mangaDetail.status || "—",
      icon: SignalIcon,
      accent: "text-cyan-300"
    },
    {
      key: "published",
      label: "Published",
      value: mangaDetail.published || "—",
      icon: CalendarIcon,
      accent: "text-sky-300"
    },
    {
      key: "chapters",
      label: "Chapters",
      value: mangaDetail.chaptersCount?.toString() ?? "—",
      icon: HashIcon,
      accent: "text-violet-300"
    },
    {
      key: "volumes",
      label: "Volumes",
      value: mangaDetail.volumesCount?.toString() ?? "—",
      icon: LibraryBigIcon,
      accent: "text-amber-300"
    },
    {
      key: "synonyms",
      label: "Synonyms",
      value: mangaDetail.titleSynonyms || "—",
      icon: TypeIcon,
      accent: "text-rose-300"
    },
    {
      key: "score",
      label: "MAL Score",
      value: mangaDetail.score != null ? mangaDetail.score.toFixed(2) : "—",
      icon: SparklesIcon,
      accent: "text-emerald-300"
    }
  ];

  const entityGroups = [
    {
      key: "authors",
      label: "Authors",
      icon: PenLineIcon,
      accent:
        "bg-gradient-to-br from-sky-500/15 to-transparent border-sky-400/30",
      iconColor: "text-sky-300",
      items: mangaDetail.authors.map((a) => ({ id: a.id, name: a.name }))
    },
    {
      key: "genres",
      label: "Genres",
      icon: TagIcon,
      accent:
        "bg-gradient-to-br from-indigo-500/15 to-transparent border-indigo-400/30",
      iconColor: "text-indigo-300",
      items: mangaDetail.genres.map((g) => ({ id: g.id, name: g.name }))
    },
    {
      key: "themes",
      label: "Themes",
      icon: DramaIcon,
      accent:
        "bg-gradient-to-br from-fuchsia-500/15 to-transparent border-fuchsia-400/30",
      iconColor: "text-fuchsia-300",
      items: mangaDetail.themes.map((t) => ({ id: t.id, name: t.name }))
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="rounded-2xl border border-border/60 bg-card/60 p-4 backdrop-blur-xl sm:p-5">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-background/50">
            <BookOpenIcon className="h-4 w-4 text-indigo-300" />
          </div>
          <h3 className="text-base font-semibold">Publication Details</h3>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {infoItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.key}
                className="flex items-start gap-3 rounded-lg border border-border/40 bg-background/30 p-3"
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

        <div className="mt-4 border-t border-border/40 pt-4">
          <EditChapterVolumesModal mangaDetail={mangaDetail} />
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card/60 p-4 backdrop-blur-xl sm:p-5">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-background/50">
            <LayersIcon className="h-4 w-4 text-fuchsia-300" />
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
                        className="bg-background/50 backdrop-blur-sm"
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
