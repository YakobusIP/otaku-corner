"use client";

import { useContext } from "react";

import GlobalPagination from "@/components/GlobalPagination";
import { AnimeContext } from "@/components/context/AnimeContext";

import { MetadataResponse } from "@/types/api.type";

import { MEDIA_TYPE } from "@/lib/enums";

type Props = {
  animeMetadata: MetadataResponse;
};

export default function AnimePagination({ animeMetadata }: Props) {
  const context = useContext(AnimeContext);
  if (!context) {
    throw new Error("Pagination must be used within an AnimeProvider");
  }

  const { setState } = context;

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > animeMetadata.pageCount) return;
    setState({ page: newPage });
  };

  return (
    <GlobalPagination
      mediaType={MEDIA_TYPE.ANIME}
      metadata={animeMetadata}
      handlePageChange={handlePageChange}
    />
  );
}
