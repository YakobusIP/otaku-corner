import { Fragment } from "react";

import {
  type AnimeScoreCriterion,
  getScoreBarPercent
} from "@/components/anime/anime-detail-helpers";

import { ratingDescriptions } from "@/lib/constants";

type AnimeDetailScoreCriteriaListProps = {
  criteria: AnimeScoreCriterion[];
};

export default function AnimeDetailScoreCriteriaList({
  criteria
}: AnimeDetailScoreCriteriaListProps) {
  return (
    <div className="space-y-5">
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

            <div
              className="h-2 overflow-hidden rounded-full bg-slate-200/80"
              role="progressbar"
              aria-valuenow={criterion.score ?? 0}
              aria-valuemin={1}
              aria-valuemax={10}
              aria-label={`${criterion.title} score`}
            >
              <div
                className="h-full rounded-full bg-[#ff6b8b] transition-all duration-500"
                style={{ width: `${barPercent}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
