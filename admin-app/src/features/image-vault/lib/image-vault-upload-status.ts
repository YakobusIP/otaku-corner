export type ImageVaultUploadPhase =
  | "preparing"
  | "uploading"
  | "finalizing"
  | "uploading-source"
  | "creating";

export type ImageVaultUploadStatus = {
  phase: ImageVaultUploadPhase;
  percent?: number;
};

export const IMAGE_VAULT_UPLOAD_PHASE_LABELS: Record<
  ImageVaultUploadPhase,
  string
> = {
  preparing: "Requesting upload URL...",
  uploading: "Uploading image...",
  finalizing: "Finalizing upload...",
  "uploading-source": "Uploading source image...",
  creating: "Saving to vault..."
};
