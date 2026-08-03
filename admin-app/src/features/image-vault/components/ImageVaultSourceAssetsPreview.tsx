import { useEffect, useState } from "react";

import ImageVaultPreviewImage from "@/features/image-vault/components/ImageVaultPreviewImage";
import ImageVaultUploadOverlay from "@/features/image-vault/components/ImageVaultUploadOverlay";
import { Button } from "@/components/ui/button";

import type {
  ImageVaultEntry,
  ImageVaultSourceAsset
} from "@/types/image-vault.type";
import type {
  ImageVaultSafetyLevel,
  SensitiveImageVisibility
} from "@/types/image-vault.type";

import {
  imageVaultSourceDownloadPath,
  resolveImageVaultPreviewUrl
} from "@/features/image-vault/lib/image-vault-preview";
import { cn } from "@/lib/utils";

import { XIcon } from "lucide-react";

const SOURCE_PREVIEW_GRID_CLASS = "grid grid-cols-2 gap-2 sm:gap-3";

type SourcePreviewItem = {
  key: string;
  src: string;
  alt: string;
  downloadUrl?: string;
  onRemove?: () => void;
  overlayLabel?: string;
};

type SourcePreviewGridProps = {
  items: SourcePreviewItem[];
  className?: string;
  imageClassName?: string;
};

function SourcePreviewGrid({
  items,
  className,
  imageClassName
}: SourcePreviewGridProps) {
  if (items.length === 0) return null;

  return (
    <div className={cn(SOURCE_PREVIEW_GRID_CLASS, className)}>
      {items.map((item) => (
        <div
          key={item.key}
          className="relative overflow-hidden rounded-md border border-border/60 bg-muted/20"
        >
          {item.downloadUrl ? (
            <ImageVaultPreviewImage
              src={item.src}
              downloadUrl={item.downloadUrl}
              alt={item.alt}
              className={cn(
                "max-h-36 w-full object-contain sm:max-h-44",
                imageClassName
              )}
            />
          ) : (
            <img
              src={item.src}
              alt={item.alt}
              className={cn(
                "max-h-36 w-full object-contain sm:max-h-44",
                imageClassName
              )}
            />
          )}
          {item.overlayLabel ? (
            <ImageVaultUploadOverlay label={item.overlayLabel} />
          ) : null}
          {item.onRemove && !item.overlayLabel ? (
            <Button
              type="button"
              size="icon"
              variant="secondary"
              className="absolute right-1.5 top-1.5 h-7 w-7 bg-background/90 shadow-md backdrop-blur-sm hover:bg-background"
              onClick={item.onRemove}
              aria-label={`Remove ${item.alt}`}
            >
              <XIcon className="h-3.5 w-3.5" />
            </Button>
          ) : null}
        </div>
      ))}
    </div>
  );
}

type LocalSourceFilesPreviewProps = {
  files: File[];
  onRemove?: (index: number) => void;
  getOverlayLabel?: (index: number) => string | undefined;
};

export function ImageVaultLocalSourceFilesPreview({
  files,
  onRemove,
  getOverlayLabel
}: LocalSourceFilesPreviewProps) {
  const [objectUrls, setObjectUrls] = useState<string[]>([]);

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setObjectUrls(urls);

    return () => {
      for (const url of urls) {
        URL.revokeObjectURL(url);
      }
    };
  }, [files]);

  if (files.length === 0 || objectUrls.length === 0) return null;

  return (
    <SourcePreviewGrid
      items={objectUrls.map((src, index) => ({
        key: `${files[index]?.name ?? "source"}-${index}-${files[index]?.size ?? 0}-${files[index]?.lastModified ?? 0}`,
        src,
        alt: `Selected source image ${index + 1}`,
        onRemove: onRemove ? () => onRemove(index) : undefined,
        overlayLabel: getOverlayLabel?.(index)
      }))}
    />
  );
}

export function resolveEntrySourceAssets(image: ImageVaultEntry): {
  sourceAssets: ImageVaultSourceAsset[];
  fromLineage: boolean;
} {
  if (image.sourceAssets.length > 0) {
    return { sourceAssets: image.sourceAssets, fromLineage: false };
  }
  const rooted = image.rootSourceAssets ?? [];
  return {
    sourceAssets: rooted,
    fromLineage: rooted.length > 0
  };
}

type EntrySourceAssetsPreviewProps = {
  entryId: string;
  sourceAssets: ImageVaultSourceAsset[];
  safetyLevel: ImageVaultSafetyLevel;
  sensitiveImageVisibility: SensitiveImageVisibility;
  title?: string;
  fromLineage?: boolean;
  onRemove?: (assetId: string) => void;
  className?: string;
};

export function ImageVaultEntrySourceAssetsPreview({
  entryId,
  sourceAssets,
  safetyLevel,
  sensitiveImageVisibility,
  title = "Source images",
  fromLineage = false,
  onRemove,
  className
}: EntrySourceAssetsPreviewProps) {
  if (sourceAssets.length === 0) return null;

  return (
    <div
      className={cn(
        "space-y-2 rounded-md border border-border/60 p-3",
        className
      )}
    >
      <p className="text-xs font-medium text-muted-foreground">
        {title}
        {fromLineage ? " (from lineage root)" : ""}
      </p>
      <SourcePreviewGrid
        items={sourceAssets.map((asset, index) => ({
          key: asset.id,
          src: resolveImageVaultPreviewUrl(
            asset.previewUrl,
            safetyLevel,
            sensitiveImageVisibility
          ),
          alt: `Source image ${index + 1}`,
          downloadUrl: imageVaultSourceDownloadPath(entryId, asset.id),
          onRemove: onRemove ? () => onRemove(asset.id) : undefined
        }))}
      />
    </div>
  );
}
