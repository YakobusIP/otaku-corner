import { type ClassValue, clsx } from "clsx";
import slugify from "slugify";
import { twMerge } from "tailwind-merge";

import type { MetadataResponse } from "@/types/api.type";
import type { PaginatedBody, PaginatedListPage } from "@/types/general.type";

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

export const generateSlug = (title: string) => {
  return slugify(title, { remove: /[:?/]/g, lower: true, trim: true });
};

export const entityFilterIncludeIds = (context?: {
  includeIds?: (string | number)[];
}): number[] | undefined => {
  const parsed = context?.includeIds
    ?.map((id) => Number(id))
    .filter((n) => Number.isInteger(n) && n >= 1);
  return parsed?.length ? parsed : undefined;
};

export const mapPaginatedBody = <T>(
  body: PaginatedBody<T>
): PaginatedListPage<T> => ({
  data: body.data,
  metadata: {
    page: body.page,
    limit: body.limit,
    pageCount: body.totalPages,
    itemCount: body.total
  } satisfies MetadataResponse
});
