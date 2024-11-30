"use client";

import { useContext } from "react";

import GlobalPagination from "@/components/GlobalPagination";
import { MangaContext } from "@/components/context/MangaContext";

import { MetadataResponse } from "@/types/api.type";

import { MEDIA_TYPE } from "@/lib/enums";

type Props = {
  mangaMetadata: MetadataResponse;
};

export default function MangaPagination({ mangaMetadata }: Props) {
  const context = useContext(MangaContext);
  if (!context) {
    throw new Error("Pagination must be used within an MangaProvider");
  }

  const { setState } = context;

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > mangaMetadata.pageCount) return;
    setState({ page: newPage });
  };

  return (
    <GlobalPagination
      mediaType={MEDIA_TYPE.MANGA}
      metadata={mangaMetadata}
      handlePageChange={handlePageChange}
    />
  );
}
