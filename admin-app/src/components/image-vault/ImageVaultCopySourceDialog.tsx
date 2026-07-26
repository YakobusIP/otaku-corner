import { Fragment, useMemo, useState } from "react";

import {
  ImageVaultFiltersProvider,
  useImageVaultFilters
} from "@/components/context/ImageVaultFiltersContext";
import ImageVaultCardBadges from "@/components/image-vault/ImageVaultCardBadges";
import ImageVaultFilters from "@/components/image-vault/ImageVaultFilters";
import {
  ListLoadingBounceDots,
  ListRetryButton,
  ListStatusPanel
} from "@/components/list-status/ListStatusPanel";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

import { useImageVaultListPage } from "@/hooks/useImageVaultListPage";
import { useLoadingDots } from "@/hooks/useLoadingDots";

import type {
  ImageVaultEntry,
  SensitiveImageVisibility
} from "@/types/image-vault.type";

import { hasActiveFilterGroups } from "@/lib/image-vault-filter-expression";
import {
  formatImageVaultEntryCaption,
  resolveImageVaultPreviewUrl
} from "@/lib/image-vault-preview";

import { useInView } from "react-intersection-observer";

const COPY_SOURCE_PAGE_SIZE = 20;
const COPY_SOURCE_GRID_CLASS =
  "grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (entry: ImageVaultEntry) => void;
  sensitiveImageVisibility?: SensitiveImageVisibility;
};

function ImageVaultCopySourceDialogContent({
  onSelect,
  portalContainer
}: {
  onSelect: (entry: ImageVaultEntry) => void;
  portalContainer: HTMLElement | null;
}) {
  const { state } = useImageVaultFilters();
  const listQuery = useImageVaultListPage({ pageSize: COPY_SOURCE_PAGE_SIZE });
  const loadingDots = useLoadingDots(listQuery.isLoading);
  const [scrollRoot, setScrollRoot] = useState<HTMLDivElement | null>(null);

  const images = useMemo(
    () => listQuery.data?.pages.flatMap((page) => page.data) ?? [],
    [listQuery.data?.pages]
  );

  const loadMore = () => {
    if (!listQuery.hasNextPage || listQuery.isFetchingNextPage) return;
    void listQuery.fetchNextPage();
  };

  const { ref: loadMoreRef } = useInView({
    skip: !listQuery.hasNextPage,
    root: scrollRoot ?? undefined,
    rootMargin: "0px 0px 72px 0px",
    threshold: 0,
    initialInView: false,
    onChange: (visible) => {
      if (!visible) return;
      loadMore();
    }
  });

  return (
    <Fragment>
      <ImageVaultFilters portalContainer={portalContainer} />

      <div
        ref={setScrollRoot}
        className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1"
      >
        {listQuery.isLoading ? (
          <ListStatusPanel
            imageSrc="/loading.webp"
            imageAlt="Loading images"
            title={
              <Fragment>
                Loading images
                <span className="inline-block w-8 text-left">{loadingDots}</span>
              </Fragment>
            }
            description="Pulling entries from the vault..."
            hint="Just a moment"
            footer={<ListLoadingBounceDots />}
            busy
          />
        ) : null}

        {listQuery.isError ? (
          <ListStatusPanel
            imageSrc="/error.webp"
            imageAlt="Failed to load images"
            title="Failed to load images"
            description="Something went wrong while fetching vault entries."
            hint="You can try loading the list again."
            footer={
              <ListRetryButton
                onRetry={() => void listQuery.refetch()}
                isRetrying={listQuery.isRefetching}
              />
            }
          />
        ) : null}

        {!listQuery.isLoading && !listQuery.isError && images.length === 0 ? (
          <ListStatusPanel
            imageSrc="/no-result.webp"
            imageAlt="No images found"
            title={
              <Fragment>
                No images found
                {hasActiveFilterGroups(state.groups)
                  ? " for the current filters"
                  : null}
              </Fragment>
            }
            description={
              hasActiveFilterGroups(state.groups)
                ? "Nothing in the vault matches your current filters."
                : "Upload an image first before copying fields."
            }
            hint={
              hasActiveFilterGroups(state.groups)
                ? "Try adjusting filters to find an entry."
                : "Close this dialog and start with a brand new entry."
            }
          />
        ) : null}

        {!listQuery.isLoading && !listQuery.isError && images.length > 0 ? (
          <Fragment>
            <div className={COPY_SOURCE_GRID_CLASS}>
              {images.map((image) => (
                <Button
                  key={image.id}
                  type="button"
                  variant="outline"
                  className="group h-auto w-full flex-col items-stretch justify-start overflow-hidden rounded-lg border-border/60 bg-card/40 p-0 text-left hover:border-primary/40 hover:bg-card/40"
                  onClick={() => onSelect(image)}
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
                      {formatImageVaultEntryCaption(image)}
                    </p>
                  </div>
                </Button>
              ))}
            </div>

            {listQuery.hasNextPage ? (
              <div
                ref={loadMoreRef}
                className="h-8 w-full shrink-0"
                aria-hidden
              />
            ) : null}

            {listQuery.hasNextPage || listQuery.isFetchingNextPage ? (
              <div className="flex justify-center pt-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={
                    listQuery.isFetchingNextPage || !listQuery.hasNextPage
                  }
                  onClick={loadMore}
                >
                  {listQuery.isFetchingNextPage ? "Loading..." : "Load more"}
                </Button>
              </div>
            ) : null}
          </Fragment>
        ) : null}
      </div>
    </Fragment>
  );
}

export default function ImageVaultCopySourceDialog({
  open,
  onOpenChange,
  onSelect,
  sensitiveImageVisibility = "MASK_EXPLICIT"
}: Props) {
  const [dialogContentElement, setDialogContentElement] =
    useState<HTMLDivElement | null>(null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        ref={setDialogContentElement}
        className="flex h-[90vh] max-h-[90vh] w-full flex-col sm:max-w-5xl xl:max-w-6xl"
      >
        <DialogHeader>
          <DialogTitle>Copy fields from image</DialogTitle>
          <DialogDescription>
            Filter and choose an existing entry to copy its metadata. Only that
            entry&apos;s fields are copied, not its follow-ups.
          </DialogDescription>
        </DialogHeader>

        {open ? (
          <ImageVaultFiltersProvider
            persistVisibilityToUrl={false}
            initialSensitiveImageVisibility={sensitiveImageVisibility}
          >
            <div className="flex min-h-0 flex-1 flex-col gap-3">
              <ImageVaultCopySourceDialogContent
                onSelect={onSelect}
                portalContainer={dialogContentElement}
              />
            </div>
          </ImageVaultFiltersProvider>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
