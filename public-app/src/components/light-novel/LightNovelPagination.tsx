"use client";

import { useContext } from "react";

import GlobalPagination from "@/components/GlobalPagination";
import { LightNovelContext } from "@/components/context/LightNovelContext";

import { MetadataResponse } from "@/types/api.type";

import { MEDIA_TYPE } from "@/lib/enums";

type Props = {
  lightNovelMetadata: MetadataResponse;
};

export default function LightNovelPagination({ lightNovelMetadata }: Props) {
  const context = useContext(LightNovelContext);
  if (!context) {
    throw new Error("Pagination must be used within an LightNovelProvider");
  }

  const { setState } = context;

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > lightNovelMetadata.pageCount) return;
    setState({ page: newPage });
  };

  return (
    <GlobalPagination
      mediaType={MEDIA_TYPE.LIGHT_NOVEL}
      metadata={lightNovelMetadata}
      handlePageChange={handlePageChange}
    />
  );
}
