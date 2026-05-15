import type { MetadataResponse } from "@/types/api.type";
import type { PaginatedBody, PaginatedListPage } from "@/types/general.type";

import { type ClassValue, clsx } from "clsx";
import slugify from "slugify";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const createUTCDate = (year: number, month: number) => {
  return new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
};

export const extractUploadedImageMap = (
  markdown: string | undefined
): Record<string, string> => {
  if (!markdown) return {};

  const map: Record<string, string> = {};
  const markdownImageRegex = /!\[.*?\]\((.*?)\)/g;

  for (const match of markdown.matchAll(markdownImageRegex)) {
    const url = match[1];
    const lastSlashIndex = url.lastIndexOf("/");
    const lastDotIndex = url.lastIndexOf(".");

    if (lastSlashIndex >= 0 && lastDotIndex > lastSlashIndex) {
      const id = url.substring(lastSlashIndex + 1, lastDotIndex);
      if (id.length > 0) {
        map[url] = id;
      }
    }
  }

  return map;
};

export const extractImageIds = (markdown: string | undefined): string[] =>
  Object.values(extractUploadedImageMap(markdown));

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

export type PaginationPageSlot = number | "ellipsis";

const PAGINATION_SLOT_FULL_LIST_MAX = 7;
const PAGINATION_SLOT_NEIGHBOR_RADIUS = 1;

export const buildPaginationPageSlots = (
  currentPage: number,
  totalPages: number
): PaginationPageSlot[] => {
  if (totalPages <= 0) return [];
  if (totalPages <= PAGINATION_SLOT_FULL_LIST_MAX) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const neighbors = PAGINATION_SLOT_NEIGHBOR_RADIUS;
  const boundaryPages = new Set<number>([1, totalPages]);
  for (
    let page = currentPage - neighbors;
    page <= currentPage + neighbors;
    page++
  ) {
    if (page >= 1 && page <= totalPages) boundaryPages.add(page);
  }

  const sortedPages = [...boundaryPages].sort((a, b) => a - b);
  const slots: PaginationPageSlot[] = [];
  let previousPage = 0;

  for (const page of sortedPages) {
    if (previousPage > 0 && page - previousPage > 1) {
      slots.push("ellipsis");
    }
    slots.push(page);
    previousPage = page;
  }

  return slots;
};
