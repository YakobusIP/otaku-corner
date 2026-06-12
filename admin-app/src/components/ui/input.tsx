import * as React from "react";

import { cn } from "@/lib/utils";

export type InputProps = React.ComponentProps<"input"> & {
  startIcon?: React.ComponentType<{ className?: string }>;
  parentClassName?: string;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, startIcon: Icon, parentClassName, ...props }, ref) => {
    const inputClassName = cn(
      "flex h-10 w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
      Icon && "pl-9",
      className
    );

    if (Icon) {
      return (
        <div
          className={cn(
            "relative flex h-10 min-h-10 w-full min-w-0 items-center",
            parentClassName
          )}
        >
          <Icon className="pointer-events-none absolute left-3 h-4 w-4 shrink-0 text-muted-foreground" />
          <input type={type} className={inputClassName} ref={ref} {...props} />
        </div>
      );
    }

    if (parentClassName) {
      return (
        <div className={parentClassName}>
          <input type={type} className={inputClassName} ref={ref} {...props} />
        </div>
      );
    }

    return (
      <input type={type} className={inputClassName} ref={ref} {...props} />
    );
  }
);
Input.displayName = "Input";

export { Input };
