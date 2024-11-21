import * as React from "react";

import { cn } from "@/lib/utils";

import * as ProgressPrimitive from "@radix-ui/react-progress";

const StatusProgressBar = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn(
        "h-full w-full flex-1 bg-primary transition-all",
        value && value === 100
          ? "bg-green-700"
          : value && value < 50
            ? "bg-destructive"
            : "bg-yellow-400"
      )}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));
StatusProgressBar.displayName = ProgressPrimitive.Root.displayName;

export { StatusProgressBar };
