export type ImageVaultUploadTarget =
  | { kind: "primary" }
  | { kind: "source"; index: number };

export type ImageVaultUploadStatus = {
  stepIndex: number;
  stepCount: number;
  label: string;
  overallPercent: number;
  overlay?: {
    target: ImageVaultUploadTarget;
    label: string;
  };
};

type AssetUploadPhase = "preparing" | "uploading" | "finalizing";

export type ImageVaultAssetUploadStatus = {
  phase: AssetUploadPhase;
  percent?: number;
};

const clampPercent = (value: number): number =>
  Math.min(100, Math.max(0, Math.round(value)));

export const getImageVaultCreateStepCount = (sourceCount: number): number =>
  // Request URL + upload primary + each source + save
  2 + Math.max(0, sourceCount) + 1;

export const getImageVaultUpdateSourceStepCount = (
  additionalSourceCount: number
): number =>
  // Each additional source + save (when sources are changing)
  Math.max(0, additionalSourceCount) + 1;

export const buildOverallPercent = (
  stepIndex: number,
  stepCount: number,
  stepFraction = 0
): number => {
  if (stepCount <= 0) return 0;
  const fraction = Math.min(1, Math.max(0, stepFraction));
  return clampPercent(((stepIndex + fraction) / stepCount) * 100);
};

export const assetPhaseFraction = (
  status: ImageVaultAssetUploadStatus
): number => {
  if (status.phase === "preparing") return 0;
  if (status.phase === "finalizing") return 1;
  return (status.percent ?? 0) / 100;
};

export const assetOverlayLabel = (
  status: ImageVaultAssetUploadStatus
): string => {
  if (status.phase === "preparing") return "Requesting URL...";
  if (status.phase === "finalizing") return "Finalizing...";
  return `${status.percent ?? 0}%`;
};

export const buildAssetStepStatus = ({
  stepIndex,
  stepCount,
  label,
  target,
  assetStatus
}: {
  stepIndex: number;
  stepCount: number;
  label: string;
  target: ImageVaultUploadTarget;
  assetStatus: ImageVaultAssetUploadStatus;
}): ImageVaultUploadStatus => ({
  stepIndex,
  stepCount,
  label,
  overallPercent: buildOverallPercent(
    stepIndex,
    stepCount,
    assetPhaseFraction(assetStatus)
  ),
  overlay: {
    target,
    label: assetOverlayLabel(assetStatus)
  }
});

export const buildSaveStepStatus = ({
  stepIndex,
  stepCount,
  label,
  complete = false
}: {
  stepIndex: number;
  stepCount: number;
  label: string;
  complete?: boolean;
}): ImageVaultUploadStatus => ({
  stepIndex,
  stepCount,
  label,
  overallPercent: complete
    ? 100
    : buildOverallPercent(stepIndex, stepCount, 0)
});

const sameOverlayTarget = (
  left?: ImageVaultUploadStatus["overlay"],
  right?: ImageVaultUploadStatus["overlay"]
): boolean => {
  if (!left && !right) return true;
  if (!left || !right) return false;
  if (left.target.kind !== right.target.kind) return false;
  if (left.target.kind === "source" && right.target.kind === "source") {
    return left.target.index === right.target.index;
  }
  return true;
};

export const createImageVaultUploadStatusEmitter = (
  onStatus?: (status: ImageVaultUploadStatus) => void
): ((status: ImageVaultUploadStatus) => void) => {
  let last: ImageVaultUploadStatus | null = null;

  return (status) => {
    if (!onStatus) return;
    if (
      last &&
      last.stepIndex === status.stepIndex &&
      last.stepCount === status.stepCount &&
      last.label === status.label &&
      last.overallPercent === status.overallPercent &&
      last.overlay?.label === status.overlay?.label &&
      sameOverlayTarget(last.overlay, status.overlay)
    ) {
      return;
    }
    last = status;
    onStatus(status);
  };
};

export const isOverlayForPrimary = (
  status: ImageVaultUploadStatus | null | undefined
): status is ImageVaultUploadStatus & {
  overlay: { target: { kind: "primary" } };
} => status?.overlay?.target.kind === "primary";

export const getSourceOverlay = (
  status: ImageVaultUploadStatus | null | undefined,
  index: number
): ImageVaultUploadStatus["overlay"] | undefined => {
  const overlay = status?.overlay;
  if (!overlay || overlay.target.kind !== "source") return undefined;
  if (overlay.target.index !== index) return undefined;
  return overlay;
};
