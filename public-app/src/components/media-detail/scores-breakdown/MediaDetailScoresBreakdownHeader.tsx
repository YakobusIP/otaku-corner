import { formatMalScoreWithMax } from "@/lib/shared/utils";

type MediaDetailScoresBreakdownHeaderProps = {
  personalScore?: number | null;
  headingId: string;
};

export default function MediaDetailScoresBreakdownHeader({
  personalScore,
  headingId
}: MediaDetailScoresBreakdownHeaderProps) {
  return (
    <div className="space-y-1">
      <h3 id={headingId} className="text-base font-semibold text-slate-900">
        Scores Breakdown
      </h3>
      <p className="text-sm text-slate-500">
        Overall:{" "}
        <span className="font-semibold text-slate-800">
          {formatMalScoreWithMax(personalScore)}
        </span>
      </p>
    </div>
  );
}
