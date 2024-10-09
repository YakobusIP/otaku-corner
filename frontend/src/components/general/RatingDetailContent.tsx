import { Separator } from "@/components/ui/separator";
import { scoreOptions } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { isMobile } from "react-device-detect";

interface RatingDetail {
  title: string;
  weight: string;
  rating: string;
}

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
    <div className="space-y-1">
      <p className="font-bold">Personal score breakdown:</p>
      {details.map((detail, index) => (
        <>
          <span
            key={index}
            className={cn(
              "flex flex-col xl:flex-row justify-between",
              isMobile ? "w-[250px]" : " w-[325px]"
            )}
          >
            <p>{`${detail.title} (${detail.weight}%):`}</p>
            <p>{detail.rating}</p>
          </span>
          <Separator />
        </>
      ))}
      <span
        className={cn(
          "flex flex-col xl:flex-row justify-between",
          isMobile ? "w-[250px]" : " w-[325px]"
        )}
      >
        <p>Final score:</p>
        <p className="text-left xl:text-right font-bold">
          {finalScore !== null && finalScore !== undefined
            ? `${finalScore} - ${selectedFinalScoreLabel?.label}`
            : "N/A"}
        </p>
      </span>
    </div>
  );
}
