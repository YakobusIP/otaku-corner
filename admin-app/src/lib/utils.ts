import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const createUTCDate = (year: number, month: number) => {
  return new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
};

export const extractImageIds = (markdown: string | undefined) => {
  if (!markdown) return [];

  const ids: string[] = [];

  const markdownImageRegex = /!\[.*?\]\((.*?)\)/g;
  const matches = markdown.matchAll(markdownImageRegex);

  for (const match of matches) {
    const url = match[1];

    const lastSlashIndex = url.lastIndexOf("/");
    const lastDotIndex = url.lastIndexOf(".");

    if (
      lastSlashIndex !== 1 &&
      lastDotIndex !== 1 &&
      lastDotIndex > lastSlashIndex
    ) {
      const id = url.substring(lastSlashIndex + 1, lastDotIndex);
      ids.push(id);
    }
  }

  return ids;
};
