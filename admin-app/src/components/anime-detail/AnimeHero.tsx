import { AnimeDetail } from "@/types/anime.type";

import { PROGRESS_STATUS } from "@/lib/enums";
import { cn } from "@/lib/utils";

import {
  CheckCircleIcon,
  ClockIcon,
  ExternalLinkIcon,
  EyeIcon,
  FilmIcon,
  PauseCircleIcon,
  PlayCircleIcon,
  StarIcon,
  TvIcon,
  XCircleIcon
} from "lucide-react";

type Props = {
  animeDetail: AnimeDetail;
};

const STATUS_THEMES: Record<
  string,
  {
    label: string;
    description: string;
    Icon: typeof EyeIcon;
    accent: string;
    dot: string;
    tileBg: string;
    tileBorder: string;
    iconColor: string;
    text: string;
    shadow: string;
  }
> = {
  PLANNED: {
    label: PROGRESS_STATUS.PLANNED,
    description: "Queued up — not started yet",
    Icon: EyeIcon,
    accent: "bg-sky-400",
    dot: "bg-sky-400 shadow-[0_0_10px_2px_rgba(56,189,248,0.7)]",
    tileBg: "bg-sky-500/15",
    tileBorder: "border-sky-400/40",
    iconColor: "text-sky-300",
    text: "text-sky-200",
    shadow: "shadow-sky-500/20"
  },
  ON_HOLD: {
    label: PROGRESS_STATUS.ON_HOLD,
    description: "Paused for now",
    Icon: PauseCircleIcon,
    accent: "bg-amber-400",
    dot: "bg-amber-400 shadow-[0_0_10px_2px_rgba(251,191,36,0.7)]",
    tileBg: "bg-amber-500/15",
    tileBorder: "border-amber-400/40",
    iconColor: "text-amber-300",
    text: "text-amber-200",
    shadow: "shadow-amber-500/20"
  },
  ON_PROGRESS: {
    label: PROGRESS_STATUS.ON_PROGRESS,
    description: "Currently watching",
    Icon: PlayCircleIcon,
    accent: "bg-emerald-400",
    dot: "bg-emerald-400 shadow-[0_0_10px_2px_rgba(52,211,153,0.7)]",
    tileBg: "bg-emerald-500/15",
    tileBorder: "border-emerald-400/40",
    iconColor: "text-emerald-300",
    text: "text-emerald-200",
    shadow: "shadow-emerald-500/20"
  },
  COMPLETED: {
    label: PROGRESS_STATUS.COMPLETED,
    description: "Finished watching",
    Icon: CheckCircleIcon,
    accent: "bg-violet-400",
    dot: "bg-violet-400 shadow-[0_0_10px_2px_rgba(167,139,250,0.7)]",
    tileBg: "bg-violet-500/15",
    tileBorder: "border-violet-400/40",
    iconColor: "text-violet-300",
    text: "text-violet-200",
    shadow: "shadow-violet-500/20"
  },
  DROPPED: {
    label: PROGRESS_STATUS.DROPPED,
    description: "Dropped without finishing",
    Icon: XCircleIcon,
    accent: "bg-rose-400",
    dot: "bg-rose-400 shadow-[0_0_10px_2px_rgba(251,113,133,0.7)]",
    tileBg: "bg-rose-500/15",
    tileBorder: "border-rose-400/40",
    iconColor: "text-rose-300",
    text: "text-rose-200",
    shadow: "shadow-rose-500/20"
  }
};

export default function AnimeHero({ animeDetail }: Props) {
  const cover =
    animeDetail.images.large_image_url ?? animeDetail.images.image_url;

  const personalScore = animeDetail.review?.personalScore;

  const status =
    STATUS_THEMES[animeDetail.review.progressStatus] ?? STATUS_THEMES.PLANNED;
  const StatusIcon = status.Icon;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/60 backdrop-blur-xl">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-500/15 via-violet-500/5 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -right-24 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-violet-500/20 blur-3xl"
      />

      <div className="relative flex flex-col gap-5 p-4 sm:p-5 md:flex-row md:gap-6 md:p-6 xl:gap-8 xl:p-8">
        <div className="flex justify-center md:block md:self-center">
          <div className="relative shrink-0">
            <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-indigo-400/40 via-violet-400/30 to-transparent blur-md" />
            <img
              src={cover}
              alt={animeDetail.title}
              className="relative h-[260px] w-[185px] rounded-xl border border-border/60 object-cover shadow-2xl sm:h-[320px] sm:w-[225px] md:h-[280px] md:w-[200px] lg:h-[340px] lg:w-[240px] xl:h-[400px] xl:w-[280px]"
            />
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="flex min-w-0 flex-col gap-1.5">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-indigo-300/80 sm:text-xs">
              Anime
            </p>
            <h1 className="break-words text-xl font-bold leading-tight text-foreground sm:text-2xl md:text-2xl lg:text-3xl xl:text-4xl">
              {animeDetail.title}
            </h1>
            {animeDetail.titleJapanese ? (
              <p className="text-sm text-muted-foreground xl:text-base">
                {animeDetail.titleJapanese}
              </p>
            ) : null}
          </div>

          <div
            className={cn(
              "relative overflow-hidden rounded-xl border border-border/50 bg-background/40 shadow-lg backdrop-blur-sm",
              status.shadow
            )}
          >
            <div
              aria-hidden
              className={cn(
                "absolute inset-y-0 left-0 w-1",
                status.accent
              )}
            />
            <div className="flex items-center gap-3 pl-4 pr-3 py-2.5 sm:gap-3.5 sm:pl-5 sm:pr-4 sm:py-3">
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border",
                  status.tileBg,
                  status.tileBorder
                )}
              >
                <StatusIcon className={cn("h-5 w-5", status.iconColor)} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Progress Status
                </p>
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden
                    className={cn(
                      "relative inline-flex h-2 w-2 shrink-0 rounded-full",
                      status.dot
                    )}
                  >
                    <span
                      className={cn(
                        "absolute inset-0 animate-ping rounded-full opacity-75",
                        status.accent
                      )}
                    />
                  </span>
                  <p
                    className={cn(
                      "text-base font-bold leading-tight md:text-lg",
                      status.text
                    )}
                  >
                    {status.label}
                  </p>
                </div>
              </div>
              <p className="hidden text-xs text-muted-foreground sm:block md:text-sm">
                {status.description}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <StatPill
              icon={<StarIcon className="h-4 w-4 text-amber-400" />}
              label="MAL"
              value={animeDetail.score ? animeDetail.score.toFixed(2) : "N/A"}
            />
            <StatPill
              icon={<StarIcon className="h-4 w-4 text-emerald-400" />}
              label="Personal"
              value={
                typeof personalScore === "number"
                  ? personalScore.toFixed(2)
                  : "N/A"
              }
            />
            <StatPill
              icon={<TvIcon className="h-4 w-4 text-sky-400" />}
              label="Episodes"
              value={animeDetail.episodesCount?.toString() ?? "—"}
            />
            <StatPill
              icon={<ClockIcon className="h-4 w-4 text-fuchsia-400" />}
              label="Duration"
              value={animeDetail.duration || "—"}
            />
          </div>

          {animeDetail.synopsis ? (
            <div className="rounded-lg border border-border/40 bg-background/30 p-3 backdrop-blur-sm sm:p-4">
              <p className="max-h-40 overflow-y-auto whitespace-pre-line text-sm leading-relaxed text-foreground/90 sm:max-h-48 xl:text-[15px]">
                {animeDetail.synopsis}
              </p>
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <a
              href={animeDetail.malUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-indigo-400/40 bg-indigo-500/10 px-3 py-1.5 text-sm font-medium text-indigo-200 transition-colors hover:bg-indigo-500/20"
            >
              <FilmIcon className="h-4 w-4" />
              View on MyAnimeList
              <ExternalLinkIcon className="h-3.5 w-3.5 opacity-70" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

type StatPillProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
};

function StatPill({ icon, label, value }: StatPillProps) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-border/40 bg-background/40 px-3 py-2 backdrop-blur-sm">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-background/50">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="truncate text-sm font-semibold tabular-nums text-foreground">
          {value}
        </p>
      </div>
    </div>
  );
}
