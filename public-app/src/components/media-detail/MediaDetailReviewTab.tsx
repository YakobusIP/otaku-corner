"use client";

import ReviewContent from "@/components/ReviewContent";
import MediaDetailScoresBreakdown from "@/components/media-detail/scores-breakdown/MediaDetailScoresBreakdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";

import {
  type MediaDetailReviewFields,
  type MediaScoreCriterion
} from "@/lib/media-detail/media-detail-helpers";

import { AlertTriangleIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import Image from "next/image";

type MediaDetailReviewTabProps<TReview extends MediaDetailReviewFields> = {
  review: TReview | null | undefined;
  buildScoreCriteria: (review: TReview) => MediaScoreCriterion[];
  spoilersRevealed: boolean;
  onRevealSpoilers: () => void;
};

export default function MediaDetailReviewTab<
  TReview extends MediaDetailReviewFields
>({
  review,
  buildScoreCriteria,
  spoilersRevealed,
  onRevealSpoilers
}: MediaDetailReviewTabProps<TReview>) {
  const hasReviewText = Boolean(review?.reviewText);

  if (!review || !hasReviewText) {
    return (
      <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-center gap-2 xl:gap-4">
          <Image
            src="/no-review.webp"
            width={500}
            height={300}
            className="w-64 rounded-xl"
            alt="No review"
            unoptimized
          />
          <p className="text-center text-muted-foreground">
            No review available yet! Please check back later.
          </p>
        </div>
      </CardContent>
    );
  }

  const scoreCriteria = buildScoreCriteria(review);
  const reviewText = review.reviewText;

  return (
    <CardContent className="pt-6">
      <div className="flex flex-col gap-6 xl:max-h-[min(70vh,42rem)] xl:flex-row xl:items-stretch">
        <aside className="order-1 w-full shrink-0 xl:order-3 xl:flex xl:flex-3 xl:basis-0 xl:items-center xl:self-stretch">
          <MediaDetailScoresBreakdown
            criteria={scoreCriteria}
            personalScore={review.personalScore}
          />
        </aside>

        <div
          className="order-2 hidden shrink-0 self-stretch xl:order-2 xl:block xl:w-px xl:bg-slate-300/70"
          role="separator"
          aria-orientation="vertical"
        />

        <div
          className={
            spoilersRevealed
              ? "order-3 flex min-h-0 min-w-0 flex-col overflow-y-auto pr-1 xl:order-1 xl:flex-7 xl:basis-0 xl:pr-2"
              : "order-3 flex min-h-0 min-w-0 flex-col pr-1 xl:order-1 xl:flex-7 xl:basis-0 xl:pr-2 xl:self-stretch"
          }
        >
          <div className="mb-4 flex shrink-0 justify-end">
            {!spoilersRevealed ? (
              <Button
                onClick={onRevealSpoilers}
                variant="outline"
                size="sm"
                className="border-orange-300 text-orange-700 hover:bg-orange-50"
              >
                <EyeOffIcon />
                Reveal Spoilers
              </Button>
            ) : (
              <Badge className="border border-orange-300 bg-orange-100 text-orange-800 hover:bg-orange-200">
                <EyeIcon className="mr-1" size={12} />
                Spoilers Visible
              </Badge>
            )}
          </div>

          {spoilersRevealed ? (
            <ReviewContent review={reviewText ?? undefined} spoilersRevealed />
          ) : (
            <div className="flex min-h-[min(20rem,50vh)] flex-1 flex-col items-center justify-center rounded-lg border-2 border-dashed border-orange-300 bg-white/95 p-8 text-center backdrop-blur-md xl:min-h-0">
              <AlertTriangleIcon className="mb-4 text-orange-500" size={48} />
              <h3 className="mb-2 text-xl font-bold text-slate-800">
                Spoiler Warning
              </h3>
              <p className="mb-4 max-w-md text-slate-600">
                This review contains spoilers that may reveal important plot
                points and story outcomes.
              </p>
              <Button
                onClick={onRevealSpoilers}
                className="bg-orange-600 text-white hover:bg-orange-700"
              >
                <EyeIcon size={16} />
                Click to Reveal Review
              </Button>
            </div>
          )}
        </div>
      </div>
    </CardContent>
  );
}
