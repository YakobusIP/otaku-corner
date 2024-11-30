"use client";

import { useEffect, useState } from "react";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination";

import { MetadataResponse } from "@/types/api.type";

import { MEDIA_TYPE } from "@/lib/enums";

type Props = {
  mediaType: MEDIA_TYPE;
  metadata: MetadataResponse;
  handlePageChange: (newPage: number) => void;
};

export default function GlobalPagination({
  mediaType,
  metadata,
  handlePageChange
}: Props) {
  const page = metadata.currentPage;
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const generatePageNumbers = (currentPage: number, pageCount: number) => {
    if (isMobile) {
      const pages = [];
      if (currentPage > 1) pages.push(currentPage - 1);
      pages.push(currentPage);
      if (currentPage < pageCount) pages.push(currentPage + 1);
      return pages;
    } else {
      const center = [
        currentPage - 2,
        currentPage - 1,
        currentPage,
        currentPage + 1,
        currentPage + 2
      ];

      if (pageCount <= 1) {
        return [1];
      }

      const filteredCenter: Array<string | number> = center.filter(
        (p) => p > 1 && p < pageCount
      );
      const includeThreeLeft = currentPage === 5;
      const includeThreeRight = currentPage === pageCount - 4;
      const includeLeftDots = currentPage > 5;
      const includeRightDots = currentPage < pageCount - 4;

      if (includeThreeLeft) filteredCenter.unshift(2);
      if (includeThreeRight) filteredCenter.push(pageCount - 1);

      if (includeLeftDots) filteredCenter.unshift("...");
      if (includeRightDots) filteredCenter.push("...");

      return [1, ...filteredCenter, pageCount];
    }
  };

  const pages = generatePageNumbers(page, metadata.pageCount);

  const pageLink = (page: number) => {
    return mediaType === MEDIA_TYPE.ANIME
      ? `/anime?page=${page}`
      : mediaType === MEDIA_TYPE.MANGA
        ? `/manga?page=${page}`
        : `/light-novel?page=${page}`;
  };

  const previousLink =
    mediaType === MEDIA_TYPE.ANIME
      ? `/anime?page=${page - 1}`
      : mediaType === MEDIA_TYPE.MANGA
        ? `/manga?page=${page - 1}`
        : `/light-novel?page=${page - 1}`;

  const nextLink =
    mediaType === MEDIA_TYPE.ANIME
      ? `/anime?page=${page + 1}`
      : mediaType === MEDIA_TYPE.MANGA
        ? `/manga?page=${page + 1}`
        : `/light-novel?page=${page + 1}`;

  const handlePageClick = (page: number) => {
    handlePageChange(page);
  };

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={previousLink}
            onClick={() => handlePageClick(page - 1)}
            isActive={page !== 1}
          />
        </PaginationItem>
        {pages.map((p, index) =>
          p === "..." ? (
            <PaginationItem key={`ellipsis-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={`page-${p}`}>
              <PaginationLink
                href={pageLink(p as number)}
                onClick={() => handlePageClick(p as number)}
                isActive={p === page}
              >
                {p}
              </PaginationLink>
            </PaginationItem>
          )
        )}
        <PaginationItem>
          <PaginationNext
            href={nextLink}
            onClick={() => handlePageClick(page + 1)}
            isActive={page !== metadata.pageCount}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
