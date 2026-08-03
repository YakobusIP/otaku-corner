import { Loader2Icon } from "lucide-react";

import { cn } from "@/lib/utils";

type Props = {
  label: string;
  className?: string;
};

export default function ImageVaultUploadOverlay({ label, className }: Props) {
  return (
    <div
      className={cn(
        "absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-background/75 px-2 text-center backdrop-blur-[2px]",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <Loader2Icon className="h-5 w-5 animate-spin text-primary" aria-hidden />
      <p className="text-sm font-semibold tabular-nums text-foreground">
        {label}
      </p>
    </div>
  );
}
