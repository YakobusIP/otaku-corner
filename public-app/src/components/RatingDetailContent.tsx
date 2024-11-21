import { Fragment } from "react";

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
          (option) => finalScore >= option.min && finalScore <= option.max
        )
      : null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <InfoIcon className="w-4 h-4 hover:cursor-pointer" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Personal Score Breakdown</DialogTitle>
          <DialogDescription>Score details on every criteria</DialogDescription>
        </DialogHeader>
        <div className="space-y-1 text-sm">
          {details.map((detail) => (
            <Fragment key={`rating-${detail.title}`}>
              <span className="flex flex-col xl:flex-row justify-between">
                <p>{`${detail.title} (${detail.weight}%):`}</p>
                <p>{detail.rating}</p>
              </span>
              <Separator />
            </Fragment>
          ))}
          <span className="flex flex-col xl:flex-row justify-between">
            <p>Final score:</p>
            <p className="text-left xl:text-right font-bold">
              {finalScore !== null && finalScore !== undefined
                ? `${finalScore} - ${selectedFinalScoreLabel?.label}`
                : "N/A"}
            </p>
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
