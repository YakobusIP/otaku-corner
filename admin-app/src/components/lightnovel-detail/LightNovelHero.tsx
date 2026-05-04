import { LightNovelDetail } from "@/types/light-novel.type";

import { PROGRESS_STATUS } from "@/lib/enums";
import { cn } from "@/lib/utils";

import {
  BookCopyIcon,
  BookOpenIcon,
  CheckCircleIcon,
  ExternalLinkIcon,
  EyeIcon,
  PauseCircleIcon,
  PlayCircleIcon,
  StarIcon,
  UserIcon,
  XCircleIcon
} from "lucide-react";

type Props = {
  lightNovelDetail: LightNovelDetail;
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
    description: "Currently reading",
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
    description: "Finished reading",
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

export default function LightNovelHero({ lightNovelDetail }: Props) {
  const cover =
    lightNovelDetail.images.large_image_url ??
    lightNovelDetail.images.image_url;

  const personalScore = lightNovelDetail.review?.personalScore;

  const status =
    STATUS_THEMES[lightNovelDetail.review.progressStatus] ??
    STATUS_THEMES.PLANNED;
  const StatusIcon = status.Icon;

  return (
    <div className="flex flex-col gap-4">
      <div className="relative flex flex-col gap-5 overflow-hidden rounded-2xl py-4 px-0 sm:py-5 @tablet:flex-row @tablet:items-center @tablet:gap-6 @tablet:p-6 @7xl:gap-8 @7xl:p-8">
        <div className="relative flex justify-center @tablet:block">
          <div className="relative shrink-0">
            <div className="absolute -inset-1 rounded-xl bg-linear-to-br from-indigo-400/40 via-violet-400/30 to-transparent blur-md" />
            <img
              src={cover}
              alt={lightNovelDetail.title}
              className="relative h-[260px] w-[185px] rounded-xl border border-border/60 object-cover shadow-2xl sm:h-[320px] sm:w-[225px] @tablet:h-[280px] @tablet:w-[200px] @5xl:h-[340px] @5xl:w-[240px] @7xl:h-[400px] @7xl:w-[280px]"
            />
          </div>
        </div>

        <div className="relative flex min-w-0 flex-1 flex-col gap-4 @tablet:max-w-[55%] @5xl:max-w-[50%]">
          <div className="flex min-w-0 flex-col gap-1.5">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-indigo-300 sm:text-xs">
              Light novel
            </p>
            <h1 className="wrap-break-word text-xl font-bold leading-tight text-foreground drop-shadow-xs sm:text-2xl @tablet:text-2xl @5xl:text-3xl @7xl:text-4xl">
              {lightNovelDetail.title}
            </h1>
            {lightNovelDetail.titleJapanese ? (
              <p className="text-sm text-muted-foreground @7xl:text-base">
                {lightNovelDetail.titleJapanese}
              </p>
            ) : null}
          </div>

          <div
            className={cn(
              "relative overflow-hidden rounded-xl border border-border/40 bg-background/35 shadow-xs backdrop-blur-xs",
              status.shadow
            )}
          >
            <div
              aria-hidden
              className={cn("absolute inset-y-0 left-0 w-1", status.accent)}
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
                      "text-base font-bold leading-tight @tablet:text-lg",
                      status.text
                    )}
                  >
                    {status.label}
                  </p>
                </div>
              </div>
              <p className="hidden text-xs text-muted-foreground sm:block @tablet:text-sm">
                {status.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatTile
          icon={<StarIcon className="h-5 w-5 text-amber-400" />}
          tint="bg-amber-500/10 border-amber-400/30"
          label="MAL Score"
          value={
            lightNovelDetail.score != null
              ? lightNovelDetail.score.toFixed(2)
              : "N/A"
          }
        />
        <StatTile
          icon={<UserIcon className="h-5 w-5 text-emerald-400" />}
          tint="bg-emerald-500/10 border-emerald-400/30"
          label="Personal Score"
          value={
            typeof personalScore === "number" ? personalScore.toFixed(2) : "N/A"
          }
        />
        <StatTile
          icon={<BookCopyIcon className="h-5 w-5 text-fuchsia-400" />}
          tint="bg-fuchsia-500/10 border-fuchsia-400/30"
          label="Volumes"
          value={lightNovelDetail.volumesCount?.toString() ?? "—"}
        />
      </div>

      {lightNovelDetail.synopsis ? (
        <div className="rounded-2xl border border-border/40 bg-background/35 p-4 shadow-xs backdrop-blur-xs sm:p-5 @tablet:p-6">
          <p className="max-h-48 overflow-y-auto whitespace-pre-line text-sm leading-relaxed text-foreground/90 sm:max-h-56 @7xl:text-[15px]">
            {lightNovelDetail.synopsis}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border/40 pt-4">
            <a
              href={lightNovelDetail.malUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-indigo-400/40 bg-indigo-500/10 px-3 py-1.5 text-sm font-medium text-indigo-200 transition-colors hover:bg-indigo-500/20"
            >
              <BookOpenIcon className="h-4 w-4" />
              View on MyAnimeList
              <ExternalLinkIcon className="h-3.5 w-3.5 opacity-70" />
            </a>
          </div>
        </div>
      ) : (
        <div>
          <a
            href={lightNovelDetail.malUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-indigo-400/40 bg-indigo-500/10 px-3 py-1.5 text-sm font-medium text-indigo-200 transition-colors hover:bg-indigo-500/20"
          >
            <BookOpenIcon className="h-4 w-4" />
            View on MyAnimeList
            <ExternalLinkIcon className="h-3.5 w-3.5 opacity-70" />
          </a>
        </div>
      )}
    </div>
  );
}

type StatTileProps = {
  icon: React.ReactNode;
  tint: string;
  label: string;
  value: string;
};

function StatTile({ icon, tint, label, value }: StatTileProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/40 bg-background/35 p-3 shadow-xs backdrop-blur-xs sm:p-4">
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border",
          tint
        )}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </p>
        <p className="truncate text-base font-bold tabular-nums text-foreground @tablet:text-lg">
          {value}
        </p>
      </div>
    </div>
  );
}
