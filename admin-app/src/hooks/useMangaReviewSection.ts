import { useMemo, useState } from "react";

import { mangaService } from "@/services/manga.service";

import {
  buildDetailReviewSaveStatusDisplay,
  useDetailReviewAutosave
} from "@/hooks/useDetailReviewAutosave";

import type { MangaDetail, MangaReviewRequest } from "@/types/manga.type";

import { PROGRESS_STATUS } from "@/lib/enums";
import { detailKeys } from "@/lib/query-keys";
import {
  computeRoundedWeightedPersonalScore,
  MANGA_REVIEW_PERSONAL_SCORE_WEIGHTS
} from "@/lib/review-personal-score";
import { createUTCDate, extractImageIds } from "@/lib/utils";

export const useMangaReviewSection = (mangaDetail: MangaDetail) => {
  const reviewObject = mangaDetail.review;

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
  const [artStyleRating, setArtStyleRating] = useState(
    reviewObject.artStyleRating || 10
  );
  const [charDevelopmentRating, setCharDevelopmentRating] = useState(
    reviewObject.charDevelopmentRating || 10
  );
  const [worldBuildingRating, setWorldBuildingRating] = useState(
    reviewObject.worldBuildingRating || 10
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
      key: "artstyle",
      label: "Art Style",
      rating: artStyleRating,
      setRating: setArtStyleRating
    },
    {
      key: "characterdevelopment",
      label: "Character Development",
      rating: charDevelopmentRating,
      setRating: setCharDevelopmentRating
    },
    {
      key: "worldbuilding",
      label: "World Building",
      rating: worldBuildingRating,
      setRating: setWorldBuildingRating
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
    consumedAt: consumedMonth
      ? createUTCDate(
          consumedMonth.getUTCFullYear(),
          consumedMonth.getUTCMonth()
        ).toISOString()
      : null,
    storylineRating,
    artStyleRating,
    charDevelopmentRating,
    worldBuildingRating,
    originalityRating
  });

  const previewPersonalScore = useMemo(
    () =>
      computeRoundedWeightedPersonalScore(
        {
          storylineRating,
          artStyleRating,
          charDevelopmentRating,
          worldBuildingRating,
          originalityRating
        },
        MANGA_REVIEW_PERSONAL_SCORE_WEIGHTS
      ),
    [
      storylineRating,
      artStyleRating,
      charDevelopmentRating,
      worldBuildingRating,
      originalityRating
    ]
  );

  const { updateReviewMutation, handleSubmit, isDirty, saveStatus } =
    useDetailReviewAutosave<MangaReviewRequest>({
      entityId: mangaDetail.id,
      detailQueryKey: detailKeys.manga(mangaDetail.id),
      snapshot,
      uploadedImages,
      setUploadedImages,
      buildSavePayload: () => {
        const currentImageIds = extractImageIds(reviewText);
        const adjustedConsumedMonth = consumedMonth
          ? createUTCDate(
              consumedMonth.getUTCFullYear(),
              consumedMonth.getUTCMonth()
            )
          : null;

        const data: MangaReviewRequest = {
          reviewText,
          progressStatus: progressStatus as PROGRESS_STATUS,
          consumedAt: adjustedConsumedMonth,
          storylineRating,
          artStyleRating,
          charDevelopmentRating,
          worldBuildingRating,
          originalityRating
        };

        return { currentImageIds, data };
      },
      saveReview: async (id, data) => {
        const res = await mangaService.updateReview(id, data);
        if (!res.success) {
          return { success: false, error: res.error };
        }
        return { success: true, message: res.data?.message };
      }
    });

  const consumedLabel = consumedMonth
    ? `${consumedMonth.toLocaleString("default", {
        month: "long"
      })} ${consumedMonth.getUTCFullYear()}`
    : "Not set";

  const saveStatusDisplay = buildDetailReviewSaveStatusDisplay(saveStatus);

  return {
    reviewObject,
    reviewText,
    setReviewText,
    uploadedImages,
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
  };
};
