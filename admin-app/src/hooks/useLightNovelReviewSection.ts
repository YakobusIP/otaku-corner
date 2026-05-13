import { useState } from "react";

import { lightNovelService } from "@/services/light-novel.service";

import {
  buildDetailReviewSaveStatusDisplay,
  useDetailReviewAutosave
} from "@/hooks/useDetailReviewAutosave";

import type {
  LightNovelDetail,
  LightNovelReviewRequest
} from "@/types/light-novel.type";

import { PROGRESS_STATUS } from "@/lib/enums";
import { detailKeys } from "@/lib/query-keys";
import { extractImageIds } from "@/lib/utils";

type Params = {
  lightNovelDetail: LightNovelDetail;
  resetParent: () => Promise<void>;
};

export const useLightNovelReviewSection = ({
  lightNovelDetail,
  resetParent
}: Params) => {
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

  const snapshot = JSON.stringify({
    reviewText: reviewText ?? "",
    progressStatus,
    storylineRating,
    worldBuildingRating,
    writingStyleRating,
    charDevelopmentRating,
    originalityRating
  });

  const { updateReviewMutation, handleSubmit, isDirty, saveStatus } =
    useDetailReviewAutosave<LightNovelReviewRequest>({
      entityId: lightNovelDetail.id,
      detailQueryKey: detailKeys.lightNovel(lightNovelDetail.id),
      snapshot,
      uploadedImages,
      setUploadedImages,
      buildSavePayload: () => {
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

        return { currentImageIds, data };
      },
      saveReview: async (id, data) => {
        const res = await lightNovelService.updateReview(id, data);
        if (!res.success) {
          return { success: false, error: res.error };
        }
        return { success: true, message: res.data?.message };
      },
      onAfterInvalidateSuccess: resetParent
    });

  const saveStatusDisplay = buildDetailReviewSaveStatusDisplay(saveStatus);

  return {
    reviewObject,
    reviewText,
    setReviewText,
    uploadedImages,
    setUploadedImages,
    progressStatus,
    setProgressStatus,
    ratingFields,
    updateReviewMutation,
    handleSubmit,
    isDirty,
    saveStatusDisplay
  };
};
