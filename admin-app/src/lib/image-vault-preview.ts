import type {
  ImageVaultSafetyLevel,
  SensitiveImageVisibility
} from "@/types/image-vault.type";
import {
  isExplicitSafetyLevel,
  isSensitiveSafetyLevel
} from "@/types/image-vault.type";

import interceptedAxios, { ensureValidAccessToken } from "@/lib/axios";

export const EXPLICIT_IMAGE_PLACEHOLDER = "/explicit-image.webp";

export function imageVaultImageDownloadPath(entryId: string): string {
  return `/api/image-vault/images/${entryId}/download-url`;
}

export function imageVaultSourceDownloadPath(entryId: string): string {
  return `/api/image-vault/images/${entryId}/source/download-url`;
}

export async function downloadImageVaultAsset(
  downloadPath: string
): Promise<void> {
  const sessionValid = await ensureValidAccessToken();
  if (!sessionValid) {
    throw new Error("Not authenticated");
  }

  const response = await interceptedAxios.get<{ downloadUrl: string }>(
    downloadPath
  );

  const downloadUrl = response.data.downloadUrl;
  if (!downloadUrl) {
    throw new Error("Download failed");
  }

  window.location.assign(downloadUrl);
}

function shouldMaskImageVaultPreview(
  safetyLevel: ImageVaultSafetyLevel,
  visibility: SensitiveImageVisibility
): boolean {
  if (visibility === "SHOW_ALL") {
    return false;
  }

  if (visibility === "MASK_EXPLICIT") {
    return isExplicitSafetyLevel(safetyLevel);
  }

  return isSensitiveSafetyLevel(safetyLevel);
}

export function resolveImageVaultPreviewUrl(
  previewUrl: string,
  safetyLevel: ImageVaultSafetyLevel,
  visibility: SensitiveImageVisibility
): string {
  if (shouldMaskImageVaultPreview(safetyLevel, visibility)) {
    return EXPLICIT_IMAGE_PLACEHOLDER;
  }

  return previewUrl;
}
