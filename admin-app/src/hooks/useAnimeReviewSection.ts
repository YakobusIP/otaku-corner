import { useMemo, useState } from "react";

import { animeService } from "@/services/anime.service";

import {
  buildDetailReviewSaveStatusDisplay,
  useDetailReviewAutosave
} from "@/hooks/useDetailReviewAutosave";

import type { AnimeDetail, AnimeReviewRequest } from "@/types/anime.type";

import { PROGRESS_STATUS } from "@/lib/enums";
import { detailKeys } from "@/lib/query-keys";
import {
  ANIME_REVIEW_PERSONAL_SCORE_WEIGHTS,
  computeRoundedWeightedPersonalScore
} from "@/lib/review-personal-score";
import { createUTCDate, extractImageIds } from "@/lib/utils";

export const useAnimeReviewSection = (animeDetail: AnimeDetail) => {
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

  const previewPersonalScore = useMemo(
    () =>
      computeRoundedWeightedPersonalScore(
        {
          storylineRating,
          qualityRating,
          voiceActingRating,
          soundTrackRating,
          charDevelopmentRating
        },
        ANIME_REVIEW_PERSONAL_SCORE_WEIGHTS
      ),
    [
      storylineRating,
      qualityRating,
      voiceActingRating,
      soundTrackRating,
      charDevelopmentRating
    ]
  );

  const { updateReviewMutation, handleSubmit, isDirty, saveStatus } =
    useDetailReviewAutosave<AnimeReviewRequest>({
      entityId: animeDetail.id,
      detailQueryKey: detailKeys.anime(animeDetail.id),
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

        return { currentImageIds, data };
      },
      saveReview: async (id, data) => {
        const res = await animeService.updateReview(id, data);
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
