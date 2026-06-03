"use client";

import * as React from "react";

import { cn } from "@/lib/shared/utils";

import * as ProgressPrimitive from "@radix-ui/react-progress";

type ScoreProgressBarProps = React.ComponentPropsWithoutRef<
  typeof ProgressPrimitive.Root
> & {
  animateIn?: boolean;
  indicatorClassName?: string;
};

const clampPercent = (value: number) => {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(100, Math.max(0, value));
};

const ScoreProgressBar = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ScoreProgressBarProps
>(({ className, value, animateIn, indicatorClassName, ...props }, ref) => {
  const target = clampPercent(value ?? 0);
  const [fill, setFill] = React.useState(() => (animateIn ? 0 : target));

  React.useEffect(() => {
    if (!animateIn) {
      setFill(target);
      return;
    }

    setFill(0);
    let firstFrame = 0;
    let secondFrame = 0;
    firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => setFill(target));
    });

    return () => {
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
    };
  }, [animateIn, target]);

  const scale = fill / 100;

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-slate-200/80",
        className
      )}
      {...props}
      value={target}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
        <ProgressPrimitive.Indicator
          className={cn(
            "absolute inset-y-0 left-0 h-full w-full origin-left rounded-full bg-[#ff6b8b]",
            "transition-transform duration-700 ease-out motion-reduce:transition-none",
            animateIn && "oc-status-bar-animated",
            indicatorClassName
          )}
          style={{ transform: `scaleX(${scale})` }}
        />
      </div>
    </ProgressPrimitive.Root>
  );
});
ScoreProgressBar.displayName = ProgressPrimitive.Root.displayName;

export { ScoreProgressBar };
