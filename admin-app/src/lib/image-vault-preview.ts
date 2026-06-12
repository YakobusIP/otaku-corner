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

export function resolveImageVaultPreviewUrl(
  previewUrl: string,
  isExplicit: boolean,
  hideExplicitImages: boolean
): string {
  if (hideExplicitImages && isExplicit) {
    return EXPLICIT_IMAGE_PLACEHOLDER;
  }

  return previewUrl;
}
