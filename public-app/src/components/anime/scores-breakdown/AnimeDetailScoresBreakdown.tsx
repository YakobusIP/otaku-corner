import { Fragment } from "react";

import AnimeDetailScoreCriteriaList from "@/components/anime/scores-breakdown/AnimeDetailScoreCriteriaList";
import AnimeDetailScoresBreakdownHeader from "@/components/anime/scores-breakdown/AnimeDetailScoresBreakdownHeader";
import AnimeDetailScoresBreakdownMobile from "@/components/anime/scores-breakdown/AnimeDetailScoresBreakdownMobile";
import { type AnimeScoreCriterion } from "@/components/anime/anime-detail-helpers";

import { cn } from "@/lib/utils";

type AnimeDetailScoresBreakdownProps = {
  criteria: AnimeScoreCriterion[];
  personalScore?: number | null;
};

const sectionClassName =
  "w-full rounded-xl border border-white/50 bg-white/55 p-4 shadow-sm backdrop-blur-sm xl:p-5";

export default function AnimeDetailScoresBreakdown({
  criteria,
  personalScore
}: AnimeDetailScoresBreakdownProps) {
  const headingId = "anime-scores-breakdown-heading";

  return (
    <Fragment>
      <section
        aria-labelledby={headingId}
        className={cn(sectionClassName, "hidden xl:block")}
      >
        <div className="mb-4 space-y-1 border-b border-slate-200/80 pb-4">
          <AnimeDetailScoresBreakdownHeader
            personalScore={personalScore}
            headingId={headingId}
          />
        </div>
        <AnimeDetailScoreCriteriaList criteria={criteria} />
      </section>

      <AnimeDetailScoresBreakdownMobile
        criteria={criteria}
        personalScore={personalScore}
        headingId={`${headingId}-mobile`}
        sectionClassName={sectionClassName}
      />
    </Fragment>
  );
}
