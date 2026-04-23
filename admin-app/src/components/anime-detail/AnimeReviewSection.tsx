import { useEffect, useRef, useState } from "react";

import { updateAnimeReviewService } from "@/services/anime.service";
import { deleteImageService } from "@/services/upload.service";

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

import { useToast } from "@/hooks/useToast";

import { AnimeDetail, AnimeReviewRequest } from "@/types/anime.type";

import { MEDIA_TYPE, PROGRESS_STATUS } from "@/lib/enums";
import { detailKeys } from "@/lib/query-keys";
import { createUTCDate, extractImageIds } from "@/lib/utils";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CalendarDaysIcon,
  CheckCircle2Icon,
  CloudIcon,
  Loader2Icon,
  NotebookPenIcon,
  PencilLineIcon,
  SaveIcon,
  SignalIcon
} from "lucide-react";
import { useDebounce } from "use-debounce";

type Props = {
  animeDetail: AnimeDetail;
};

export default function AnimeReviewSection({ animeDetail }: Props) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const reviewObject = animeDetail.review;

  const [reviewText, setReviewText] = useState(
    reviewObject.reviewText ?? undefined
  );
  const [uploadedImages, setUploadedImages] = useState<string[]>(
    extractImageIds(reviewObject.reviewText ?? undefined)
  );

  const [progressStatus, setProgressStatus] = useState(
    reviewObject.progressStatus as string
  );
  const [consumedMonth, setConsumedMonth] = useState<Date | null>(
    reviewObject.consumedAt ? new Date(reviewObject.consumedAt) : null
  );
  const [storylineRating, setStorylineRating] = useState(
    reviewObject.storylineRating || 10
  );
  const [qualityRating, setQualityRating] = useState(
    reviewObject.qualityRating || 10
  );
  const [voiceActingRating, setVoiceActingRating] = useState(
    reviewObject.voiceActingRating || 10
  );
  const [soundTrackRating, setSoundTrackRating] = useState(
    reviewObject.soundTrackRating || 10
  );
  const [charDevelopmentRating, setCharDevelopmentRating] = useState(
    reviewObject.charDevelopmentRating || 10
  );

  const ratingFields = [
    {
      key: "storyline",
      label: "Storyline",
      rating: storylineRating,
      setRating: setStorylineRating
    },
    {
      key: "quality",
      label: "Animation Quality",
      rating: qualityRating,
      setRating: setQualityRating
    },
    {
      key: "voiceacting",
      label: "Voice Acting",
      rating: voiceActingRating,
      setRating: setVoiceActingRating
    },
    {
      key: "soundtrack",
      label: "Soundtrack",
      rating: soundTrackRating,
      setRating: setSoundTrackRating
    },
    {
      key: "characterdevelopment",
      label: "Character Development",
      rating: charDevelopmentRating,
      setRating: setCharDevelopmentRating
    }
  ];

  const snapshot = JSON.stringify({
    reviewText: reviewText ?? "",
    progressStatus,
    consumedAt: consumedMonth
      ? createUTCDate(
          consumedMonth.getUTCFullYear(),
          consumedMonth.getUTCMonth()
        ).toISOString()
      : null,
    storylineRating,
    qualityRating,
    voiceActingRating,
    soundTrackRating,
    charDevelopmentRating
  });

  const savedSnapshotRef = useRef<string>(snapshot);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [debouncedSnapshot] = useDebounce(snapshot, 5000);

  const updateReviewMutation = useMutation({
    mutationFn: async (payload: {
      currentImageIds: string[];
      data: AnimeReviewRequest;
      snapshotAtSave: string;
      silent: boolean;
    }) => {
      const previouslyUploadedImageIds = Object.values(uploadedImages);
      const removedImageIds = previouslyUploadedImageIds.filter(
        (id) => !payload.currentImageIds.includes(id)
      );

      await Promise.all(
        removedImageIds.map(async (id) => {
          const response = await deleteImageService(id);
          if (!response.success) throw new Error(response.error);
          return response.data;
        })
      );

      const reviewResponse = await updateAnimeReviewService(
        animeDetail.id,
        payload.data
      );
      if (!reviewResponse.success) throw new Error(reviewResponse.error);

      return {
        message: reviewResponse.data?.message,
        currentImageIds: payload.currentImageIds,
        snapshotAtSave: payload.snapshotAtSave,
        silent: payload.silent
      };
    },
    onSuccess: async ({ message, currentImageIds, snapshotAtSave, silent }) => {
      savedSnapshotRef.current = snapshotAtSave;
      setLastSavedAt(new Date());
      await queryClient.invalidateQueries({
        queryKey: detailKeys.anime(animeDetail.id)
      });
      setUploadedImages([...currentImageIds]);
      if (!silent) {
        toast.toast({
          title: "All set!",
          description: message ?? "Review saved successfully"
        });
      }
    },
    onError: (error: Error) => {
      toast.toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: error.message
      });
    }
  });

  const buildPayload = (silent: boolean, snapshotAtSave: string) => {
    const currentImageIds = extractImageIds(reviewText);
    const adjustedConsumedMonth = consumedMonth
      ? createUTCDate(
          consumedMonth.getUTCFullYear(),
          consumedMonth.getUTCMonth()
        )
      : null;

    const data: AnimeReviewRequest = {
      reviewText,
      progressStatus: progressStatus as PROGRESS_STATUS,
      consumedAt: adjustedConsumedMonth,
      storylineRating,
      qualityRating,
      voiceActingRating,
      soundTrackRating,
      charDevelopmentRating
    };

    return { currentImageIds, data, snapshotAtSave, silent };
  };

  const handleSubmit = () => {
    updateReviewMutation.mutate(buildPayload(false, snapshot));
  };

  useEffect(() => {
    if (
      debouncedSnapshot !== savedSnapshotRef.current &&
      !updateReviewMutation.isPending
    ) {
      updateReviewMutation.mutate(buildPayload(true, debouncedSnapshot));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSnapshot, updateReviewMutation.isPending]);

  const isDirty = snapshot !== savedSnapshotRef.current;

  const consumedLabel = consumedMonth
    ? `${consumedMonth.toLocaleString("default", {
        month: "long"
      })} ${consumedMonth.getUTCFullYear()}`
    : "Not set";

  const saveStatus: {
    icon: React.ReactNode;
    text: string;
    tone: string;
  } = updateReviewMutation.isPending
    ? {
        icon: <Loader2Icon className="h-3.5 w-3.5 animate-spin" />,
        text: "Saving...",
        tone: "text-sky-300"
      }
    : isDirty
      ? {
          icon: <CloudIcon className="h-3.5 w-3.5" />,
          text: "Unsaved changes — autosave 5s after you stop editing",
          tone: "text-amber-300"
        }
      : lastSavedAt
        ? {
            icon: <CheckCircle2Icon className="h-3.5 w-3.5" />,
            text: `Saved at ${lastSavedAt.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit"
            })}`,
            tone: "text-emerald-300"
          }
        : {
            icon: <CloudIcon className="h-3.5 w-3.5" />,
            text: "Autosave 5s after you stop editing",
            tone: "text-muted-foreground"
          };

  return (
    <div className="rounded-2xl border border-border/40 bg-background/35 shadow-sm backdrop-blur-sm">
      <div className="flex flex-col gap-1 border-b border-border/40 p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-violet-500/30 to-fuchsia-500/20">
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
          <div className="flex items-center gap-3 rounded-lg border border-border/40 bg-background/35 p-3 shadow-sm backdrop-blur-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-sky-500/25 to-indigo-500/20">
              <SignalIcon className="h-4 w-4 text-sky-300" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Progress Status
              </Label>
              <ProgressStatus
                id={animeDetail.id}
                progressStatus={progressStatus}
                setProgressStatus={setProgressStatus}
                triggerClassName="w-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-border/40 bg-background/35 p-3 shadow-sm backdrop-blur-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-emerald-500/25 to-teal-500/20">
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

        <div className="rounded-lg border border-border/40 bg-background/35 p-3 shadow-sm backdrop-blur-sm sm:p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Personal Ratings
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
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
            mediaType={MEDIA_TYPE.ANIME}
            reviewId={reviewObject.id}
            setUploadedImages={setUploadedImages}
          />
        </div>

        <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div
            className={`inline-flex items-center gap-1.5 text-xs ${saveStatus.tone}`}
          >
            {saveStatus.icon}
            <span>{saveStatus.text}</span>
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
