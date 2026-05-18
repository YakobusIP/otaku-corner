import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function fixFloatingError(value: number) {
  return parseFloat(value.toFixed(2));
}

export const formatScoreFixedOrNa = (
  score: number | null | undefined,
  digits = 2
) => {
  if (score == null || Number.isNaN(Number(score))) {
    return "N/A";
  }
  return Number(score).toFixed(digits);
};

export const formatMalScoreWithMax = (score: number | null | undefined) => {
  if (score == null || Number.isNaN(Number(score))) {
    return "N/A";
  }
  return `${Number(score).toFixed(2)}/10`;
};
