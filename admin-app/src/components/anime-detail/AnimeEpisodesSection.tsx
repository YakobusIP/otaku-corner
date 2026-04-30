import { AnimeDetail } from "@/types/anime.type";

import { CalendarDaysIcon, ListVideoIcon } from "lucide-react";

type Props = {
  animeDetail: AnimeDetail;
};

export default function AnimeEpisodesSection({ animeDetail }: Props) {
  const total = animeDetail.episodesCount ?? 0;
  const fetched = animeDetail.episodes.length;
  const progress = total > 0 ? Math.min(100, (fetched / total) * 100) : 0;

  const progressTone =
    fetched === 0 || total === 0
      ? "text-rose-300"
      : fetched < total
        ? "text-amber-300"
        : "text-emerald-300";

  const barTone =
    fetched === 0 || total === 0
      ? "from-rose-500/70 to-rose-400/70"
      : fetched < total
        ? "from-amber-500/70 to-amber-400/70"
        : "from-emerald-500/70 to-emerald-400/70";

  return (
    <div className="rounded-2xl border border-border/40 bg-background/35 shadow-sm backdrop-blur-sm">
      <div className="flex flex-col gap-3 border-b border-border/40 p-4 sm:p-5 tablet:flex-row tablet:items-center tablet:justify-between desktop:flex-row desktop:items-center desktop:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-sky-500/30 to-indigo-500/20">
            <ListVideoIcon className="h-4 w-4 text-sky-300" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-semibold">Episodes</h3>
            <p className="text-xs text-muted-foreground">
              Fetched episodes for this season
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 tablet:items-end desktop:items-end">
          <p className={`text-sm font-semibold tabular-nums ${progressTone}`}>
            {fetched} / {total || "?"} episodes
          </p>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-background/35 sm:w-56 tablet:w-48 lg:w-56">
            <div
              className={`h-full rounded-full bg-gradient-to-r transition-all ${barTone}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="p-2 sm:p-3">
        {animeDetail.episodes.length > 0 ? (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 desktop:grid-cols-4">
            {animeDetail.episodes.map((episode) => (
              <div
                key={episode.number}
                className="group flex gap-3 rounded-lg border border-border/40 bg-background/35 p-3 shadow-sm backdrop-blur-sm transition-colors hover:border-indigo-400/40 hover:bg-background/40"
              >
                <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-md border border-border/40 bg-gradient-to-br from-indigo-500/20 to-violet-500/10">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    EP
                  </span>
                  <span className="text-lg font-bold tabular-nums text-foreground">
                    {episode.number}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-medium text-foreground">
                    {episode.title}
                  </p>
                  {episode.titleRomaji ? (
                    <p className="line-clamp-1 text-xs text-muted-foreground">
                      {episode.titleRomaji}
                      {episode.titleJapanese
                        ? ` · ${episode.titleJapanese}`
                        : ""}
                    </p>
                  ) : null}
                  {episode.aired ? (
                    <div className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                      <CalendarDaysIcon className="h-3 w-3" />
                      {episode.aired}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border/40 bg-background/35 p-10 text-center shadow-sm backdrop-blur-sm">
            <ListVideoIcon className="h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No episodes available yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
