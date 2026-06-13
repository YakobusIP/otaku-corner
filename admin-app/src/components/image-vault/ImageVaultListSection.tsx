import { Fragment, useMemo } from "react";

import { useImageVaultFilters } from "@/components/context/ImageVaultFiltersContext";
import ImageVaultCardBadges from "@/components/image-vault/ImageVaultCardBadges";
import {
  ListLoadingBounceDots,
  ListRetryButton,
  ListStatusPanel
} from "@/components/list-status/ListStatusPanel";
import { Button } from "@/components/ui/button";

import type { UseImageVaultListPageResult } from "@/hooks/useImageVaultListPage";
import { useLoadingDots } from "@/hooks/useLoadingDots";

import type { ImageVaultEntry } from "@/types/image-vault.type";

import { resolveImageVaultPreviewUrl } from "@/lib/image-vault-preview";

import { UploadIcon } from "lucide-react";
import { useInView } from "react-intersection-observer";

const IMAGE_VAULT_GRID_CLASS =
  "grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5";

type Props = {
  listQuery: UseImageVaultListPageResult;
  scrollRoot: HTMLDivElement | null;
  onSelectImage: (image: ImageVaultEntry) => void;
  onUploadClick: () => void;
};

export default function ImageVaultListSection({
  listQuery,
  scrollRoot,
  onSelectImage,
  onUploadClick
}: Props) {
  const {
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    isRefetching,
    refetch
  } = listQuery;

  const loadingDots = useLoadingDots(isLoading);
  const { state } = useImageVaultFilters();
  const images = useMemo(
    () => listQuery.data?.pages.flatMap((page) => page.data) ?? [],
    [listQuery.data?.pages]
  );

  const loadMore = () => {
    if (!hasNextPage || isFetchingNextPage) return;
    void fetchNextPage();
  };

  const { ref: loadMoreRef } = useInView({
    skip: !hasNextPage,
    root: scrollRoot ?? undefined,
    rootMargin: "0px 0px 72px 0px",
    threshold: 0,
    initialInView: false,
    onChange: (visible) => {
      if (!visible) return;
      loadMore();
    }
  });

  if (isLoading) {
    return (
      <ListStatusPanel
        imageSrc="/loading.webp"
        imageAlt="Loading images"
        title={
          <>
            Loading images
            <span className="inline-block w-8 text-left">{loadingDots}</span>
          </>
        }
        description="Pulling entries from the vault..."
        hint="Just a moment"
        footer={<ListLoadingBounceDots />}
        busy
      />
    );
  }

  if (isError) {
    return (
      <ListStatusPanel
        imageSrc="/error.webp"
        imageAlt="Failed to load images"
        title="Failed to load images"
        description="Something went wrong while fetching the vault."
        hint="You can try loading the list again."
        footer={
          <ListRetryButton
            onRetry={() => void refetch()}
            isRetrying={isRefetching}
          />
        }
      />
    );
  }

  if (images.length === 0) {
    return (
      <ListStatusPanel
        imageSrc="/no-result.webp"
        imageAlt="No images found"
        title={
          <>
            No images found
            {state.search ? ` for "${state.search}"` : null}
          </>
        }
        description="Nothing in the vault matches your current filters."
        hint="Try a different search or upload a new image."
        footer={
          <Button type="button" onClick={onUploadClick}>
            <UploadIcon />
            Upload image
          </Button>
        }
      />
    );
  }

  return (
    <Fragment>
      <div className={IMAGE_VAULT_GRID_CLASS}>
        {images.map((image) => (
          <Button
            key={image.id}
            type="button"
            variant="outline"
            className="group h-auto w-full flex-col items-stretch justify-start overflow-hidden rounded-lg border-border/60 bg-card/40 p-0 text-left hover:border-primary/40 hover:bg-card/40"
            onClick={() => onSelectImage(image)}
          >
            <div className="aspect-square shrink-0 overflow-hidden bg-muted/20">
              <img
                src={resolveImageVaultPreviewUrl(
                  image.previewUrl,
                  image.safetyLevel,
                  state.sensitiveImageVisibility
                )}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover transition group-hover:scale-[1.02]"
              />
            </div>
            <div className="flex flex-col gap-2 p-3">
              <ImageVaultCardBadges
                originType={image.originType}
                safetyLevel={image.safetyLevel}
                categories={image.categories}
                isFollowUp={image.parentId != null}
              />
              <p className="line-clamp-2 h-10 overflow-hidden whitespace-normal text-xs leading-5 text-muted-foreground">
                {image.originType === "AI"
                  ? image.prompt || "No prompt"
                  : image.sourceUrl || "Uploaded human image"}
              </p>
            </div>
          </Button>
        ))}
      </div>

      {hasNextPage ? (
        <div ref={loadMoreRef} className="h-8 w-full shrink-0" aria-hidden />
      ) : null}

      {hasNextPage || isFetchingNextPage ? (
        <div className="flex justify-center pt-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isFetchingNextPage || !hasNextPage}
            onClick={loadMore}
          >
            {isFetchingNextPage ? "Loading..." : "Load more"}
          </Button>
        </div>
      ) : null}
    </Fragment>
  );
}
