"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";

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

type Props = {
  metadata: MetadataResponse;
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
};

export default function GlobalPagination({ metadata, page, setPage }: Props) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

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

  const pages = generatePageNumbers(metadata.currentPage, metadata.pageCount);

  const handlePageClick = (newPage: number) => {
    setPage(newPage);
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < metadata.pageCount) {
      setPage(page + 1);
    }
  };

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={handlePreviousPage}
            isActive={metadata.currentPage === 1}
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
                onClick={() => handlePageClick(p as number)}
                isActive={p === metadata.currentPage}
              >
                {p}
              </PaginationLink>
            </PaginationItem>
          )
        )}
        <PaginationItem>
          <PaginationNext
            onClick={handleNextPage}
            isActive={metadata.currentPage === metadata.pageCount}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
