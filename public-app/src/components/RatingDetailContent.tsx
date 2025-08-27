import { Fragment } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

import { scoreOptions } from "@/lib/constants";
import { fixFloatingError } from "@/lib/utils";

import { InfoIcon } from "lucide-react";

type RatingDetail = {
  title: string;
  weight: string;
  rating: string;
};

type Props = {
  details: RatingDetail[];
  finalScore?: number | null;
};

export default function RatingDetailContent({ details, finalScore }: Props) {
  const selectedFinalScoreLabel =
    finalScore !== null && finalScore !== undefined
      ? scoreOptions.find(
          (option) =>
            fixFloatingError(finalScore) >= option.min &&
            fixFloatingError(finalScore) <= option.max
        )
      : null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className="text-slate-600 hover:text-slate-800 hover:bg-white/40"
        >
          <InfoIcon size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white/90 backdrop-blur-xl border border-white/40 text-slate-800 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-800">
            Personal Score Breakdown
          </DialogTitle>
          <DialogDescription>Score details on every criteria</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {details.map((detail) => (
            <Fragment key={`rating-${detail.title}`}>
              <div className="flex justify-between items-center">
                <span className="text-slate-700">{`${detail.title} (${detail.weight}%):`}</span>
                <span className="font-semibold text-slate-800">
                  {detail.rating}
                </span>
              </div>
              <Separator className="border-slate-300" />
            </Fragment>
          ))}
          <div className="flex justify-between items-center font-bold text-lg text-slate-800">
            <span>Final score:</span>
            <span>
              {finalScore !== null && finalScore !== undefined
                ? `${fixFloatingError(finalScore)} - ${selectedFinalScoreLabel?.label}`
                : "N/A"}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
