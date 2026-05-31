"use client";

import AnimeDetailScoreCriteriaList from "@/components/anime/scores-breakdown/AnimeDetailScoreCriteriaList";
import AnimeDetailScoresBreakdownHeader from "@/components/anime/scores-breakdown/AnimeDetailScoresBreakdownHeader";
import { type AnimeScoreCriterion } from "@/components/anime/anime-detail-helpers";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";

import { cn } from "@/lib/utils";

import { ChevronDownIcon } from "lucide-react";

type AnimeDetailScoresBreakdownMobileProps = {
  criteria: AnimeScoreCriterion[];
  personalScore?: number | null;
  headingId: string;
  sectionClassName: string;
};

export default function AnimeDetailScoresBreakdownMobile({
  criteria,
  personalScore,
  headingId,
  sectionClassName
}: AnimeDetailScoresBreakdownMobileProps) {
  return (
    <Collapsible defaultOpen={false} className="group w-full xl:hidden">
      <section
        aria-labelledby={headingId}
        className={cn(sectionClassName, "flex flex-col gap-0")}
      >
        <div className="flex items-center justify-between gap-3">
          <AnimeDetailScoresBreakdownHeader
            personalScore={personalScore}
            headingId={headingId}
          />
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 shrink-0 text-slate-600 hover:bg-white/60"
            >
              <ChevronDownIcon className="size-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              <span className="sr-only">Toggle scores breakdown</span>
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="flex flex-col overflow-hidden">
          <div className="mt-4 border-t border-slate-200/80 pt-4">
            <AnimeDetailScoreCriteriaList criteria={criteria} />
          </div>
        </CollapsibleContent>
      </section>
    </Collapsible>
  );
}
