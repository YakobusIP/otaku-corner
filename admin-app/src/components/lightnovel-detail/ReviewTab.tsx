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

import {
  LightNovelDetail,
  LightNovelReviewRequest
} from "@/types/lightnovel.type";

import { MEDIA_TYPE, PROGRESS_STATUS } from "@/lib/enums";
import { extractImageIds } from "@/lib/utils";

import { Loader2Icon } from "lucide-react";

type Props = {
  lightNovelDetail: LightNovelDetail;
  resetParent: () => Promise<void>;
};

export default function ReviewTab({ lightNovelDetail, resetParent }: Props) {
  const toast = useToast();
  const reviewObject = lightNovelDetail.review;

  const [review, setReview] = useState(reviewObject.review ?? undefined);
  const [uploadedImages, setUploadedImages] = useState<string[]>(
    extractImageIds(reviewObject.review ?? undefined)
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

  const [isLoadingUpdateReview, setIsLoadingUpdateReview] = useState(false);

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
      label: "Voice Acting",
      rating: writingStyleRating,
      setRating: setWritingStyleRating
    },
    {
      key: "characterdevelopment",
      label: "Soundtrack Rating",
      rating: charDevelopmentRating,
      setRating: setCharDevelopmentRating
    },
    {
      key: "originality",
      label: "Character Development Rating",
      rating: originalityRating,
      setRating: setOriginalityRating
    }
  ];

  const onSubmit = async () => {
    setIsLoadingUpdateReview(true);

    const currentImageIds = extractImageIds(review);
    const previouslyUploadedImageIds = Object.values(uploadedImages);
    const removedImageIds = previouslyUploadedImageIds.filter(
      (id) => !currentImageIds.includes(id)
    );

    await Promise.all(
      removedImageIds.map((id) => {
        return deleteImageService(id);
      })
    );

    // const adjustedConsumedMonth = consumedMonth
    //   ? createUTCDate(
    //       consumedMonth.getUTCFullYear(),
    //       consumedMonth.getUTCMonth()
    //     )
    //   : null;

    const data: LightNovelReviewRequest = {
      review,
      progressStatus: progressStatus as PROGRESS_STATUS,
      storylineRating,
      worldBuildingRating,
      writingStyleRating,
      charDevelopmentRating,
      originalityRating
    };
    const response = await updateLightNovelReviewService(
      lightNovelDetail.id,
      data
    );
    if (response.success) {
      toast.toast({
        title: "All set!",
        description: response.data.message
      });
      setUploadedImages([...currentImageIds]);
      resetParent();
    } else {
      toast.toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: response.error
      });
    }
    setIsLoadingUpdateReview(false);
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
          review={review}
          setReview={setReview}
          mediaType={MEDIA_TYPE.LIGHT_NOVEL}
          reviewId={reviewObject.id}
          setUploadedImages={setUploadedImages}
        />
        <Button type="submit" className="mt-4" onClick={onSubmit}>
          {isLoadingUpdateReview && (
            <Loader2Icon className="w-4 h-4 animate-spin" />
          )}
          Submit review
        </Button>
      </div>
    </TabsContent>
  );
}
