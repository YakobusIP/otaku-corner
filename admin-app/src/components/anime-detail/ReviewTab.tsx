import { useState } from "react";

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
import { TabsContent } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";

import { useToast } from "@/hooks/useToast";

import { AnimeDetail, AnimeReviewRequest } from "@/types/anime.type";

import { MEDIA_TYPE, PROGRESS_STATUS } from "@/lib/enums";
import { createUTCDate, extractImageIds } from "@/lib/utils";

import { CalendarDaysIcon, Loader2Icon } from "lucide-react";

type Props = {
  animeDetail: AnimeDetail;
  resetParent: () => Promise<void>;
};

export default function ReviewTab({ animeDetail, resetParent }: Props) {
  const toast = useToast();
  const reviewObject = animeDetail.review;

  const [review, setReview] = useState(reviewObject.review ?? undefined);
  const [uploadedImages, setUploadedImages] = useState<string[]>(
    extractImageIds(reviewObject.review ?? undefined)
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

  const [isLoadingUpdateReview, setIsLoadingUpdateReview] = useState(false);

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

  const handleSubmit = async () => {
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

    const adjustedConsumedMonth = consumedMonth
      ? createUTCDate(
          consumedMonth.getUTCFullYear(),
          consumedMonth.getUTCMonth()
        )
      : null;

    const data: AnimeReviewRequest = {
      review,
      progressStatus: progressStatus as PROGRESS_STATUS,
      consumedAt: adjustedConsumedMonth,
      storylineRating,
      qualityRating,
      voiceActingRating,
      soundTrackRating,
      charDevelopmentRating
    };

    const response = await updateAnimeReviewService(animeDetail.id, data);
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
                id={animeDetail.id}
                progressStatus={progressStatus}
                setProgressStatus={setProgressStatus}
              />
            </div>
            <Popover>
              <PopoverTrigger className="self-end pb-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <CalendarDaysIcon
                        className={
                          consumedMonth ? "text-green-700" : "text-red-600"
                        }
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      {consumedMonth ? (
                        <p>
                          Consumed at{" "}
                          {consumedMonth.toLocaleString("default", {
                            month: "long"
                          })}{" "}
                          {consumedMonth.getUTCFullYear()}
                        </p>
                      ) : (
                        <p>Consumed date is not set</p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
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
          <RatingSelect ratingFields={ratingFields} />
        </div>
        <ReviewEditor
          review={review}
          setReview={setReview}
          mediaType={MEDIA_TYPE.ANIME}
          reviewId={reviewObject.id}
          setUploadedImages={setUploadedImages}
        />
        <Button type="submit" className="mt-4" onClick={handleSubmit}>
          {isLoadingUpdateReview && (
            <Loader2Icon className="w-4 h-4 animate-spin" />
          )}
          Submit review
        </Button>
      </div>
    </TabsContent>
  );
}
