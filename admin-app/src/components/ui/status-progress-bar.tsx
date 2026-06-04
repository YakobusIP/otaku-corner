import * as React from "react";

import { cn } from "@/lib/utils";

import * as ProgressPrimitive from "@radix-ui/react-progress";

type StatusProgressBarProps = React.ComponentPropsWithoutRef<
  typeof ProgressPrimitive.Root
> & {
  animateIn?: boolean;
};

const clampPct = (n: number) => {
  if (!Number.isFinite(n)) return 0;
  return Math.min(100, Math.max(0, n));
};

const StatusProgressBar = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  StatusProgressBarProps
>(({ className, value, animateIn, ...props }, ref) => {
  const target = clampPct(value ?? 0);
  const [fill, setFill] = React.useState(() => (animateIn ? 0 : target));

  React.useEffect(() => {
    if (!animateIn) {
      setFill(target);
      return;
    }
    setFill(0);
    let a = 0;
    let b = 0;
    a = requestAnimationFrame(() => {
      b = requestAnimationFrame(() => setFill(target));
    });
    return () => {
      cancelAnimationFrame(a);
      cancelAnimationFrame(b);
    };
  }, [animateIn, target]);

  const toneClass =
    target >= 100
      ? "bg-green-700"
      : target < 50
        ? "bg-destructive"
        : "bg-yellow-400";

  const scale = fill / 100;

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
        className
      )}
      {...props}
      value={target}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
        <ProgressPrimitive.Indicator
          className={cn(
            "absolute inset-y-0 left-0 h-full w-full origin-left rounded-full",
            "transition-transform duration-700 ease-out motion-reduce:transition-none",
            animateIn && "oc-status-bar-animated",
            toneClass
          )}
          style={{ transform: `scaleX(${scale})` }}
        />
      </div>
    </ProgressPrimitive.Root>
  );
});
StatusProgressBar.displayName = ProgressPrimitive.Root.displayName;

export { StatusProgressBar };
