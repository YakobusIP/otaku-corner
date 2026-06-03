import MediaDetailReviewTab from "@/components/media-detail/MediaDetailReviewTab";

import { type MediaDetailSpoilerState } from "@/types/media-detail.type";

import {
  type MediaDetailReviewFields,
  type MediaScoreCriterion
} from "@/lib/media-detail/media-detail-helpers";

export const buildMediaDetailReviewTab = <
  TReview extends MediaDetailReviewFields
>(
  review: TReview | null | undefined,
  buildScoreCriteria: (review: TReview) => MediaScoreCriterion[],
  spoilerState: MediaDetailSpoilerState
) => (
  <MediaDetailReviewTab
    review={review}
    buildScoreCriteria={buildScoreCriteria}
    spoilersRevealed={spoilerState.spoilersRevealed}
    onRevealSpoilers={spoilerState.handleRevealSpoilers}
  />
);
