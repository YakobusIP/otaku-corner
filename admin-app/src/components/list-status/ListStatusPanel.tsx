import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { RefreshCwIcon } from "lucide-react";

type ListStatusPanelProps = {
  imageSrc: string;
  imageAlt: string;
  title: ReactNode;
  description: string;
  hint?: string;
  footer?: ReactNode;
  busy?: boolean;
  titleClassName?: string;
  descriptionClassName?: string;
};

export function ListStatusPanel({
  imageSrc,
  imageAlt,
  title,
  description,
  hint,
  footer,
  busy,
  titleClassName = "text-xl font-bold text-foreground",
  descriptionClassName = "text-sm text-muted-foreground"
}: ListStatusPanelProps) {
  return (
    <section
      className="flex justify-center py-8"
      aria-busy={busy}
      aria-live={busy ? "polite" : undefined}
    >
      <Card className="h-fit w-full max-w-md border border-border/60 bg-card/80 shadow-2xl backdrop-blur-xl">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <img
              src={imageSrc}
              width={400}
              height={400}
              className="mx-auto w-64"
              alt={imageAlt}
            />
          </div>

          <div className="space-y-3">
            <h2 className={titleClassName}>{title}</h2>
            <p className={descriptionClassName}>{description}</p>
            {hint ? (
              <p className="mt-2 text-xs text-muted-foreground/80">{hint}</p>
            ) : null}
          </div>

          {footer ? <div className="mt-8">{footer}</div> : null}
        </CardContent>
      </Card>
    </section>
  );
}

export function ListLoadingBounceDots() {
  return (
    <div className="flex justify-center space-x-2">
      <div
        className="h-2 w-2 animate-bounce rounded-full bg-rose-400/70"
        style={{ animationDelay: "0ms" }}
      />
      <div
        className="h-2 w-2 animate-bounce rounded-full bg-rose-400"
        style={{ animationDelay: "150ms" }}
      />
      <div
        className="h-2 w-2 animate-bounce rounded-full bg-rose-500"
        style={{ animationDelay: "300ms" }}
      />
    </div>
  );
}

type ListRetryButtonProps = {
  onRetry: () => void;
  isRetrying: boolean;
};

export function ListRetryButton({ onRetry, isRetrying }: ListRetryButtonProps) {
  return (
    <Button
      type="button"
      onClick={() => void onRetry()}
      disabled={isRetrying}
    >
      <RefreshCwIcon className={isRetrying ? "animate-spin" : undefined} />
      {isRetrying ? "Retrying..." : "Try again"}
    </Button>
  );
}
