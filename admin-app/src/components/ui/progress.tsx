import * as React from "react";

import { cn } from "@/lib/utils";

import * as ProgressPrimitive from "@radix-ui/react-progress";

type ProgressProps = React.ComponentPropsWithoutRef<
  typeof ProgressPrimitive.Root
>;

const clampPct = (n: number) => {
  if (!Number.isFinite(n)) return 0;
  return Math.min(100, Math.max(0, n));
};

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, ...props }, ref) => {
  const pct = clampPct(value ?? 0);
  const scale = pct / 100;

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-secondary",
        className
      )}
      {...props}
      value={pct}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
        <ProgressPrimitive.Indicator
          className={cn(
            "absolute inset-y-0 left-0 h-full w-full origin-left rounded-full bg-primary",
            "transition-transform duration-300 ease-out motion-reduce:transition-none"
          )}
          style={{ transform: `scaleX(${scale})` }}
        />
      </div>
    </ProgressPrimitive.Root>
  );
});
Progress.displayName = ProgressPrimitive.Root.displayName;

export default Progress;
