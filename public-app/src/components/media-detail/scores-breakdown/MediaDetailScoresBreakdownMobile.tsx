"use client";

import { useState } from "react";

import MediaDetailScoreCriteriaList from "@/components/media-detail/scores-breakdown/MediaDetailScoreCriteriaList";
import MediaDetailScoresBreakdownHeader from "@/components/media-detail/scores-breakdown/MediaDetailScoresBreakdownHeader";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";

import { type MediaScoreCriterion } from "@/lib/media-detail-helpers";
import { cn } from "@/lib/utils";

import { ChevronDownIcon } from "lucide-react";

type MediaDetailScoresBreakdownMobileProps = {
  criteria: MediaScoreCriterion[];
  personalScore?: number | null;
  headingId: string;
  sectionClassName: string;
};

export default function MediaDetailScoresBreakdownMobile({
  criteria,
  personalScore,
  headingId,
  sectionClassName
}: MediaDetailScoresBreakdownMobileProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="group w-full xl:hidden"
    >
      <section
        aria-labelledby={headingId}
        className={cn(sectionClassName, "flex flex-col gap-0")}
      >
        <div className="flex items-center justify-between gap-3">
          <MediaDetailScoresBreakdownHeader
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
            <MediaDetailScoreCriteriaList
              criteria={criteria}
              barAnimateIn={isOpen}
            />
          </div>
        </CollapsibleContent>
      </section>
    </Collapsible>
  );
}
