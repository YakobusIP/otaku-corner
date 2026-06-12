import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import ImageVaultCardBadges from "@/components/image-vault/ImageVaultCardBadges";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import type { UseImageVaultListPageResult } from "@/hooks/useImageVaultListPage";

import type { ImageVaultEntry } from "@/types/image-vault.type";

import { resolveImageVaultPreviewUrl } from "@/lib/image-vault-preview";

import { ImageIcon } from "lucide-react";
import { useInView } from "react-intersection-observer";

const IMAGE_VAULT_GRID_CLASS =
  "grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5";

const MD_BREAKPOINT = 768;
const XL_BREAKPOINT = 1280;
const XL2_BREAKPOINT = 1536;

const getImageVaultGridColumnCount = (width: number) => {
  if (width >= XL2_BREAKPOINT) return 5;
  if (width >= XL_BREAKPOINT) return 4;
  if (width >= MD_BREAKPOINT) return 3;
  return 2;
};

const useImageVaultGridColumnCount = () => {
  const [columnCount, setColumnCount] = useState(() =>
    typeof window === "undefined"
      ? 2
      : getImageVaultGridColumnCount(window.innerWidth)
  );

  useEffect(() => {
    const updateColumnCount = () => {
      setColumnCount(getImageVaultGridColumnCount(window.innerWidth));
    };

    window.addEventListener("resize", updateColumnCount);
    updateColumnCount();
    return () => window.removeEventListener("resize", updateColumnCount);
  }, []);

  return columnCount;
};

function ImageVaultCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-border/60 bg-card/40">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="flex flex-col gap-2 p-3">
        <div className="flex flex-wrap gap-1">
          <Skeleton className="h-5 w-12 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}

type Props = {
  listQuery: UseImageVaultListPageResult;
  scrollRoot: HTMLDivElement | null;
  hideExplicitImages: boolean;
  onSelectImage: (image: ImageVaultEntry) => void;
  onUploadClick: () => void;
};

export default function ImageVaultListSection({
  listQuery,
  scrollRoot,
  hideExplicitImages,
  onSelectImage,
  onUploadClick
}: Props) {
  const skeletonCount = useImageVaultGridColumnCount();
  const images = useMemo(
    () => listQuery.data?.pages.flatMap((page) => page.data) ?? [],
    [listQuery.data?.pages]
  );

  const { hasNextPage, isFetchingNextPage, isLoading, isError } = listQuery;

  const listQueryRef = useRef(listQuery);
  listQueryRef.current = listQuery;

  const fetchNextIfNeeded = useCallback(() => {
    const query = listQueryRef.current;
    if (!query.hasNextPage || query.isFetchingNextPage) return;
    void query.fetchNextPage();
  }, []);

  const { ref: loadMoreRef } = useInView({
    skip: !hasNextPage,
    root: scrollRoot ?? undefined,
    rootMargin: "0px 0px 72px 0px",
    threshold: 0,
    initialInView: false,
    onChange: (visible) => {
      if (!visible) return;
      fetchNextIfNeeded();
    }
  });

  if (isLoading) {
    return (
      <div
        className={IMAGE_VAULT_GRID_CLASS}
        aria-busy="true"
        aria-label="Loading images"
      >
        {Array.from({ length: skeletonCount }, (_, index) => (
          <ImageVaultCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (isError) {
    return <p className="text-sm text-destructive">Failed to load images.</p>;
  }

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border/60 py-16 text-center">
        <ImageIcon className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No images found.</p>
        <Button type="button" size="sm" onClick={onUploadClick}>
          Upload image
        </Button>
      </div>
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
                  image.isExplicit,
                  hideExplicitImages
                )}
                alt=""
                className="h-full w-full object-cover transition group-hover:scale-[1.02]"
              />
            </div>
            <div className="flex flex-col gap-2 p-3">
              <ImageVaultCardBadges
                originType={image.originType}
                isExplicit={image.isExplicit}
                categories={image.categories}
              />
              <p className="line-clamp-2 h-10 overflow-hidden text-xs leading-5 text-muted-foreground">
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
            onClick={fetchNextIfNeeded}
          >
            {isFetchingNextPage ? "Loading..." : "Load more"}
          </Button>
        </div>
      ) : null}
    </Fragment>
  );
}
