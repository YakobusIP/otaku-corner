import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { CopyIcon } from "lucide-react";
import { toast } from "sonner";

type Props = {
  id: string;
  label: string;
  value: string;
  onBlur: () => void;
  onChange: (value: string) => void;
  isInvalid?: boolean;
  errors?: Array<{ message?: string } | undefined>;
  rows?: number;
  className?: string;
};

export default function ImageVaultPromptTextarea({
  id,
  label,
  value,
  onBlur,
  onChange,
  isInvalid = false,
  errors,
  rows = 5,
  className
}: Props) {
  const handleCopy = async () => {
    const text = value.trim();
    if (!text) return;

    try {
      await navigator.clipboard.writeText(value);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Could not copy prompt");
    }
  };

  return (
    <Field data-invalid={isInvalid}>
      <div className="flex items-center justify-between gap-2">
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
          onClick={() => void handleCopy()}
          disabled={!value.trim()}
          aria-label={`Copy ${label.toLowerCase()} to clipboard`}
        >
          <CopyIcon className="h-3.5 w-3.5" />
        </Button>
      </div>
      <Textarea
        id={id}
        value={value}
        onBlur={onBlur}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        className={className}
        aria-invalid={isInvalid}
      />
      {isInvalid ? <FieldError errors={errors} /> : null}
    </Field>
  );
}
