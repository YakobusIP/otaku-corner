import { Dispatch, SetStateAction } from "react";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

import { ratingDescriptions } from "@/lib/constants";

type RatingField = {
  key: string;
  label: string;
  rating: number;
  setRating: Dispatch<SetStateAction<number>>;
};

type Props = {
  ratingFields: RatingField[];
};

export default function RatingSelect({ ratingFields }: Props) {
  return (
    <>
      {ratingFields.map((field) => (
        <div key={field.key} className="flex flex-col gap-2 w-full">
          <Label>{field.label}</Label>
          <Select
            defaultValue="10"
            value={field.rating.toString()}
            onValueChange={(value) => field.setRating(parseInt(value, 10))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[...Array(11).keys()].map((rating) => {
                return (
                  <SelectItem
                    key={`${field.key}-${rating}`}
                    value={rating.toString()}
                  >
                    {rating} - {ratingDescriptions[rating]}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      ))}
    </>
  );
}
