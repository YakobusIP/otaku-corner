"use client";

import { Fragment } from "react";

import { ScoreProgressBar } from "@/components/ui/score-progress-bar";

import { ratingDescriptions } from "@/lib/constants";
import {
  type MediaScoreCriterion,
  getScoreBarPercent
} from "@/lib/media-detail-helpers";

import { useInView } from "react-intersection-observer";

type MediaDetailScoreCriteriaListProps = {
  criteria: MediaScoreCriterion[];
  barAnimateIn?: boolean;
};

export default function MediaDetailScoreCriteriaList({
  criteria,
  barAnimateIn
}: MediaDetailScoreCriteriaListProps) {
  const { ref, inView } = useInView({
    threshold: 0.2,
    triggerOnce: true
  });
  const shouldAnimateBars = barAnimateIn ?? inView;

  return (
    <div ref={ref} className="space-y-5">
      {criteria.map((criterion) => {
        const barPercent = getScoreBarPercent(criterion.score);
        const scoreLabel =
          criterion.score != null
            ? (ratingDescriptions[criterion.score] ?? null)
            : null;

        return (
          <div key={criterion.title} className="space-y-2">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm font-medium text-slate-800">
                {criterion.title}
              </span>
              <span className="shrink-0 text-right text-sm text-slate-900">
                {criterion.score != null ? (
                  <Fragment>
                    <span className="font-bold tabular-nums">
                      {criterion.score}
                    </span>
                    <span className="font-normal text-slate-500"> / 10</span>
                    {scoreLabel ? (
                      <span className="font-normal text-slate-600">
                        {" "}
                        - {scoreLabel}
                      </span>
                    ) : null}
                  </Fragment>
                ) : (
                  <span className="text-slate-400">Not rated</span>
                )}
              </span>
            </div>

            <ScoreProgressBar
              key={
                shouldAnimateBars
                  ? `open-${criterion.title}`
                  : `closed-${criterion.title}`
              }
              animateIn={shouldAnimateBars}
              value={barPercent}
              aria-valuenow={criterion.score ?? 0}
              aria-valuemin={1}
              aria-valuemax={10}
              aria-label={`${criterion.title} score`}
            />
          </div>
        );
      })}
    </div>
  );
}
