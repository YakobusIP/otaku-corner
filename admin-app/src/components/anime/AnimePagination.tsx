import { useContext } from "react";

import { AnimeContext } from "@/components/context/AnimeContext";
import { Button } from "@/components/ui/button";

import { MetadataResponse } from "@/types/api.type";

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
    if (newPage >= 1 && newPage < animeMetadata.pageCount) {
      setState({ page: newPage });
    }
  };

  return (
    <div className="border-t border-border/50 p-3 md:p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
          Showing {(animeMetadata.page - 1) * animeMetadata.limit + 1} to{" "}
          {Math.min(
            animeMetadata.page * animeMetadata.limit,
            animeMetadata.itemCount
          )}{" "}
          of {animeMetadata.itemCount} results
        </p>
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={animeMetadata.page === 1}
            onClick={() =>
              handlePageChange(Math.max(1, animeMetadata.page - 1))
            }
            className="flex-1 sm:flex-none"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={
              animeMetadata.page * animeMetadata.limit >=
              animeMetadata.itemCount
            }
            onClick={() => handlePageChange(animeMetadata.page + 1)}
            className="flex-1 sm:flex-none"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
