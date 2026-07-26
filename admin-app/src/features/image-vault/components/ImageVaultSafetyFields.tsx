import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import {
  IMAGE_VAULT_SAFETY_LEVELS,
  IMAGE_VAULT_SAFETY_LEVEL_LABELS,
  isExplicitSafetyLevel
} from "@/types/image-vault.type";
import type { ImageVaultSafetyLevel } from "@/types/image-vault.type";

import { cn } from "@/lib/utils";

import {
  EyeOffIcon,
  FlameIcon,
  ShieldCheckIcon,
  type LucideIcon
} from "lucide-react";

type Props = {
  safetyLevel: ImageVaultSafetyLevel;
  safetyReason: string;
  onSafetyLevelChange: (value: ImageVaultSafetyLevel) => void;
  onSafetyReasonChange: (value: string) => void;
  safetyReasonInvalid?: boolean;
  safetyReasonErrors?: Array<{ message?: string } | undefined>;
  idPrefix?: string;
};

const SAFETY_LEVEL_ICONS: Record<ImageVaultSafetyLevel, LucideIcon> = {
  SAFE: ShieldCheckIcon,
  NSFW: EyeOffIcon,
  EXPLICIT: FlameIcon
};

const SAFETY_LEVEL_STYLES: Record<ImageVaultSafetyLevel, string> = {
  SAFE: "data-[selected=true]:border-emerald-500/70 data-[selected=true]:bg-emerald-500/15 data-[selected=true]:text-emerald-200",
  NSFW: "data-[selected=true]:border-amber-500/70 data-[selected=true]:bg-amber-500/15 data-[selected=true]:text-amber-200",
  EXPLICIT:
    "data-[selected=true]:border-rose-500/70 data-[selected=true]:bg-rose-500/15 data-[selected=true]:text-rose-200"
};

export default function ImageVaultSafetyFields({
  safetyLevel,
  safetyReason,
  onSafetyLevelChange,
  onSafetyReasonChange,
  safetyReasonInvalid = false,
  safetyReasonErrors,
  idPrefix = "vault"
}: Props) {
  const showReasonField = safetyLevel !== "SAFE";
  const safetyLabelId = `${idPrefix}-safety-level-label`;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label id={safetyLabelId}>Safety</Label>
        <div
          role="radiogroup"
          aria-labelledby={safetyLabelId}
          className="grid grid-cols-3 gap-2"
        >
          {IMAGE_VAULT_SAFETY_LEVELS.map((level) => {
            const Icon = SAFETY_LEVEL_ICONS[level];
            const selected = safetyLevel === level;

            return (
              <Button
                key={level}
                type="button"
                variant="outline"
                role="radio"
                aria-checked={selected}
                aria-label={IMAGE_VAULT_SAFETY_LEVEL_LABELS[level]}
                data-selected={selected}
                className={cn(
                  "h-10 min-w-0 px-0 md:px-3",
                  "border-border/70 bg-muted/20 text-muted-foreground hover:border-primary/40 hover:bg-accent/40",
                  "data-[selected=true]:shadow-sm",
                  SAFETY_LEVEL_STYLES[level]
                )}
                onClick={() => {
                  onSafetyLevelChange(level);
                  if (level === "SAFE") {
                    onSafetyReasonChange("");
                  }
                }}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden md:inline">
                  {IMAGE_VAULT_SAFETY_LEVEL_LABELS[level]}
                </span>
              </Button>
            );
          })}
        </div>
      </div>

      {showReasonField ? (
        <Field data-invalid={safetyReasonInvalid}>
          <FieldLabel htmlFor={`${idPrefix}-safety-reason`}>
            Safety reason
            {isExplicitSafetyLevel(safetyLevel) ? "" : " (optional)"}
          </FieldLabel>
          <Input
            id={`${idPrefix}-safety-reason`}
            value={safetyReason}
            onChange={(event) => onSafetyReasonChange(event.target.value)}
            aria-invalid={safetyReasonInvalid}
          />
          {safetyReasonInvalid ? (
            <FieldError errors={safetyReasonErrors} />
          ) : null}
        </Field>
      ) : null}
    </div>
  );
}
