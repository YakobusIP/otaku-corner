import Progress from "@/components/ui/progress";

import type { ImageVaultUploadStatus } from "@/features/image-vault/lib/image-vault-upload-status";

type Props = {
  status: ImageVaultUploadStatus;
};

export default function ImageVaultOverallUploadProgress({ status }: Props) {
  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
        <p className="min-w-0 truncate">{status.label}</p>
        <p className="shrink-0 tabular-nums">
          Step {status.stepIndex + 1} of {status.stepCount}
        </p>
      </div>
      <Progress value={status.overallPercent} />
    </div>
  );
}
