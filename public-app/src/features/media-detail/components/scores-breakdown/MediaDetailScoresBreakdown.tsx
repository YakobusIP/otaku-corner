import { Fragment } from "react";

import MediaDetailScoreCriteriaList from "@/features/media-detail/components/scores-breakdown/MediaDetailScoreCriteriaList";
import MediaDetailScoresBreakdownHeader from "@/features/media-detail/components/scores-breakdown/MediaDetailScoresBreakdownHeader";
import MediaDetailScoresBreakdownMobile from "@/features/media-detail/components/scores-breakdown/MediaDetailScoresBreakdownMobile";

import { type MediaScoreCriterion } from "@/features/media-detail/lib/media-detail-helpers";
import { cn } from "@/lib/shared/utils";

type MediaDetailScoresBreakdownProps = {
  criteria: MediaScoreCriterion[];
  personalScore?: number | null;
};

const sectionClassName =
  "w-full rounded-xl border border-white/50 bg-white/55 p-4 shadow-sm backdrop-blur-sm xl:p-5";

export default function MediaDetailScoresBreakdown({
  criteria,
  personalScore
}: MediaDetailScoresBreakdownProps) {
  const headingId = "media-detail-scores-breakdown-heading";

  return (
    <Fragment>
      <section
        aria-labelledby={headingId}
        className={cn(sectionClassName, "hidden xl:block")}
      >
        <div className="mb-4 space-y-1 border-b border-slate-200/80 pb-4">
          <MediaDetailScoresBreakdownHeader
            personalScore={personalScore}
            headingId={headingId}
          />
        </div>
        <MediaDetailScoreCriteriaList criteria={criteria} />
      </section>

      <MediaDetailScoresBreakdownMobile
        criteria={criteria}
        personalScore={personalScore}
        headingId={`${headingId}-mobile`}
        sectionClassName={sectionClassName}
      />
    </Fragment>
  );
}
