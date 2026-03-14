import { useState } from "react";

import { updateLightNovelReviewService } from "@/services/lightnovel.service";
import { deleteImageService } from "@/services/upload.service";

import ProgressStatus from "@/components/ProgressStatus";
import RatingSelect from "@/components/RatingSelect";
import ReviewEditor from "@/components/ReviewEditor";
import VolumeProgressModal from "@/components/lightnovel-detail/VolumeProgressModal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { TabsContent } from "@/components/ui/tabs";

import { useToast } from "@/hooks/useToast";
import { detailKeys } from "@/lib/query-keys";

import {
  LightNovelDetail,
  LightNovelReviewRequest
} from "@/types/lightnovel.type";

import { MEDIA_TYPE, PROGRESS_STATUS } from "@/lib/enums";
import { extractImageIds } from "@/lib/utils";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";

type Props = {
  lightNovelDetail: LightNovelDetail;
  resetParent: () => Promise<void>;
};

export default function ReviewTab({ lightNovelDetail, resetParent }: Props) {
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
    <TabsContent value="reviews">
      <div className="flex flex-col pt-4">
        <h2 className="mb-4">Reviews</h2>
        <div className="flex flex-col xl:flex-row items-center gap-4 mb-4">
          <div className="flex w-full items-center justify-between gap-4">
            <div className="flex flex-col gap-2">
              <Label>Progress Status</Label>
              <ProgressStatus
                id={lightNovelDetail.id}
                progressStatus={progressStatus}
                setProgressStatus={setProgressStatus}
              />
            </div>
            <VolumeProgressModal
              lightNovelDetail={lightNovelDetail}
              resetParent={resetParent}
            />
          </div>
          <RatingSelect ratingFields={ratingFields} />
        </div>
        <ReviewEditor
          review={reviewText}
          setReview={setReviewText}
          mediaType={MEDIA_TYPE.LIGHT_NOVEL}
          reviewId={reviewObject.id}
          setUploadedImages={setUploadedImages}
        />
        <Button type="submit" className="mt-4" onClick={onSubmit}>
          {updateReviewMutation.isPending && (
            <Loader2Icon className="w-4 h-4 animate-spin" />
          )}
          Submit review
        </Button>
      </div>
    </TabsContent>
  );
}
