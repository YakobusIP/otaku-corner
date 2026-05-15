import ProgressStatus from "@/components/ProgressStatus";
import RatingSelect from "@/components/RatingSelect";
import ReviewEditor from "@/components/ReviewEditor";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import MonthPicker from "@/components/ui/month-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";

import { useMangaReviewSection } from "@/hooks/useMangaReviewSection";

import type { MangaDetail } from "@/types/manga.type";

import { MEDIA_TYPE } from "@/lib/enums";
import { cn, createUTCDate } from "@/lib/utils";

import {
  CalendarDaysIcon,
  Loader2Icon,
  NotebookPenIcon,
  PencilLineIcon,
  SaveIcon,
  SignalIcon
} from "lucide-react";

type Props = {
  mangaDetail: MangaDetail;
};

export default function MangaReviewSection({ mangaDetail }: Props) {
  const {
    reviewObject,
    reviewText,
    setReviewText,
    setUploadedImages,
    progressStatus,
    setProgressStatus,
    consumedMonth,
    setConsumedMonth,
    consumedLabel,
    ratingFields,
    previewPersonalScore,
    updateReviewMutation,
    handleSubmit,
    isDirty,
    saveStatusDisplay
  } = useMangaReviewSection(mangaDetail);

  return (
    <div className="rounded-2xl border border-border/40 bg-background/35 shadow-xs backdrop-blur-xs">
      <div className="flex flex-col gap-1 border-b border-border/40 p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-linear-to-br from-violet-500/30 to-fuchsia-500/20">
            <NotebookPenIcon className="h-4 w-4 text-violet-300" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-semibold">Review</h3>
            <p className="text-xs text-muted-foreground">
              Your progress, ratings, and personal notes
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 p-4 sm:gap-5 sm:p-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-lg border border-border/40 bg-background/35 p-3 shadow-xs backdrop-blur-xs">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-linear-to-br from-sky-500/25 to-indigo-500/20">
              <SignalIcon className="h-4 w-4 text-sky-300" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Progress Status
              </Label>
              <ProgressStatus
                id={mangaDetail.id}
                progressStatus={progressStatus}
                setProgressStatus={setProgressStatus}
                triggerClassName="w-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-border/40 bg-background/35 p-3 shadow-xs backdrop-blur-xs">
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-linear-to-br",
                consumedMonth
                  ? "from-emerald-500/25 to-teal-500/20"
                  : "from-rose-500/25 to-red-500/20"
              )}
            >
              <CalendarDaysIcon
                className={`h-4 w-4 ${
                  consumedMonth ? "text-emerald-300" : "text-rose-300"
                }`}
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Consumed Month
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start gap-2 ${
                      consumedMonth ? "" : "text-muted-foreground"
                    }`}
                  >
                    <CalendarDaysIcon
                      className={`h-4 w-4 shrink-0 ${
                        consumedMonth ? "text-emerald-400" : "text-rose-400"
                      }`}
                    />
                    <span className="truncate">{consumedLabel}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-fit">
                  <p className="text-center font-bold">Month consumed</p>
                  <MonthPicker
                    currentMonth={
                      consumedMonth ||
                      createUTCDate(
                        new Date().getUTCFullYear(),
                        new Date().getUTCMonth()
                      )
                    }
                    onMonthChange={(value) => setConsumedMonth(value)}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border/40 bg-background/35 p-3 shadow-xs backdrop-blur-xs sm:p-4">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Personal Ratings
            </p>
            {previewPersonalScore != null ? (
              <p className="text-xs tabular-nums text-muted-foreground">
                Weighted score{" "}
                <span className="font-semibold text-foreground">
                  {previewPersonalScore.toFixed(2)}
                </span>
              </p>
            ) : null}
          </div>
          <div className="grid grid-cols-1 gap-3 @min-[640px]:grid-cols-2 @tablet:grid-cols-3 @7xl:grid-cols-5">
            <RatingSelect ratingFields={ratingFields} />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <PencilLineIcon className="h-4 w-4 text-violet-300" />
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Review Text
            </Label>
          </div>
          <ReviewEditor
            review={reviewText}
            setReview={setReviewText}
            mediaType={MEDIA_TYPE.MANGA}
            reviewId={reviewObject.id}
            setUploadedImages={setUploadedImages}
          />
        </div>

        <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div
            className={`inline-flex items-center gap-1.5 text-sm ${saveStatusDisplay.tone}`}
          >
            {saveStatusDisplay.icon}
            <span>{saveStatusDisplay.text}</span>
          </div>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={updateReviewMutation.isPending || !isDirty}
            className="w-full gap-2 sm:w-auto"
          >
            {updateReviewMutation.isPending ? (
              <Loader2Icon className="h-4 w-4 animate-spin" />
            ) : (
              <SaveIcon className="h-4 w-4" />
            )}
            Submit review
          </Button>
        </div>
      </div>
    </div>
  );
}
