import { useEffect, useState } from "react";

import { updateLightNovelReviewService } from "@/services/lightnovel.service";
import { deleteImageService } from "@/services/upload.service";

import ProgressStatus from "@/components/ProgressStatus";
import RatingSelect from "@/components/RatingSelect";
import ReviewEditor from "@/components/ReviewEditor";
import VolumeProgressModal from "@/components/lightnovel-detail/VolumeProgressModal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { useToast } from "@/hooks/useToast";
import { detailKeys } from "@/lib/query-keys";

import {
  LightNovelDetail,
  LightNovelReviewRequest
} from "@/types/lightnovel.type";

import { MEDIA_TYPE, PROGRESS_STATUS } from "@/lib/enums";
import { extractImageIds } from "@/lib/utils";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CalendarDaysIcon,
  Loader2Icon,
  NotebookPenIcon,
  PencilLineIcon,
  SaveIcon,
  SignalIcon
} from "lucide-react";

type Props = {
  lightNovelDetail: LightNovelDetail;
  resetParent: () => Promise<void>;
};

export default function LightNovelReviewSection({
  lightNovelDetail,
  resetParent
}: Props) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const reviewObject = lightNovelDetail.review;

  const [reviewText, setReviewText] = useState(
    reviewObject.reviewText ?? undefined
  );
  const [uploadedImages, setUploadedImages] = useState<string[]>(
    extractImageIds(reviewObject.reviewText ?? undefined)
  );

  const [progressStatus, setProgressStatus] = useState(
    reviewObject.progressStatus as string
  );
  const [storylineRating, setStorylineRating] = useState(
    reviewObject.storylineRating || 10
  );
  const [worldBuildingRating, setWorldBuildingRating] = useState(
    reviewObject.worldBuildingRating || 10
  );
  const [writingStyleRating, setWritingStyleRating] = useState(
    reviewObject.writingStyleRating || 10
  );
  const [charDevelopmentRating, setCharDevelopmentRating] = useState(
    reviewObject.charDevelopmentRating || 10
  );
  const [originalityRating, setOriginalityRating] = useState(
    reviewObject.originalityRating || 10
  );

  useEffect(() => {
    const r = lightNovelDetail.review;
    setReviewText(r.reviewText ?? undefined);
    setUploadedImages(extractImageIds(r.reviewText ?? undefined));
    setProgressStatus(r.progressStatus as string);
    setStorylineRating(r.storylineRating || 10);
    setWorldBuildingRating(r.worldBuildingRating || 10);
    setWritingStyleRating(r.writingStyleRating || 10);
    setCharDevelopmentRating(r.charDevelopmentRating || 10);
    setOriginalityRating(r.originalityRating || 10);
  }, [lightNovelDetail.id, lightNovelDetail.review.updatedAt]);

  const ratingFields = [
    {
      key: "storyline",
      label: "Storyline",
      rating: storylineRating,
      setRating: setStorylineRating
    },
    {
      key: "worldbuilding",
      label: "World Building",
      rating: worldBuildingRating,
      setRating: setWorldBuildingRating
    },
    {
      key: "writingstyle",
      label: "Writing Style",
      rating: writingStyleRating,
      setRating: setWritingStyleRating
    },
    {
      key: "characterdevelopment",
      label: "Character Development",
      rating: charDevelopmentRating,
      setRating: setCharDevelopmentRating
    },
    {
      key: "originality",
      label: "Originality",
      rating: originalityRating,
      setRating: setOriginalityRating
    }
  ];

  const updateReviewMutation = useMutation({
    mutationFn: async (payload: {
      currentImageIds: string[];
      data: LightNovelReviewRequest;
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

      const reviewResponse = await updateLightNovelReviewService(
        lightNovelDetail.id,
        payload.data
      );
      if (!reviewResponse.success) throw new Error(reviewResponse.error);

      return {
        message: reviewResponse.data?.message,
        currentImageIds: payload.currentImageIds
      };
    },
    onSuccess: async ({ message, currentImageIds }) => {
      await queryClient.invalidateQueries({
        queryKey: detailKeys.lightNovel(lightNovelDetail.id)
      });
      await resetParent();
      setUploadedImages([...currentImageIds]);
      toast.toast({
        title: "All set!",
        description: message ?? "Review saved successfully"
      });
    },
    onError: (error: Error) => {
      toast.toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: error.message
      });
    }
  });

  const onSubmit = () => {
    const currentImageIds = extractImageIds(reviewText);
    const data: LightNovelReviewRequest = {
      reviewText,
      progressStatus: progressStatus as PROGRESS_STATUS,
      storylineRating,
      worldBuildingRating,
      writingStyleRating,
      charDevelopmentRating,
      originalityRating
    };

    updateReviewMutation.mutate({ currentImageIds, data });
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-xl">
      <div className="flex flex-col gap-1 border-b border-border/50 p-4 sm:p-5">
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
          <div className="flex items-center gap-3 rounded-lg border border-border/40 bg-background/30 p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-sky-500/25 to-indigo-500/20">
              <SignalIcon className="h-4 w-4 text-sky-300" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Progress Status
              </Label>
              <ProgressStatus
                id={lightNovelDetail.id}
                progressStatus={progressStatus}
                setProgressStatus={setProgressStatus}
                triggerClassName="w-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-border/40 bg-background/30 p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-emerald-500/25 to-teal-500/20">
              <CalendarDaysIcon className="h-4 w-4 text-emerald-300" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Volume progress
              </Label>
              <div className="flex items-center gap-2">
                <VolumeProgressModal
                  lightNovelDetail={lightNovelDetail}
                  resetParent={resetParent}
                />
                <span className="hidden text-xs text-muted-foreground sm:inline">
                  Mark volumes read by month
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border/40 bg-background/20 p-3 sm:p-4">
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
            mediaType={MEDIA_TYPE.LIGHT_NOVEL}
            reviewId={reviewObject.id}
            setUploadedImages={setUploadedImages}
          />
        </div>

        <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
          <Button
            type="submit"
            onClick={onSubmit}
            disabled={updateReviewMutation.isPending}
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
